import { fetchWithRetry } from "./fetch-with-retry";
import { rewriteHtmlImages, type WpImage } from "./wp-media";
import { rewriteInternalLinks } from "./wp-links";
import { slugify } from "../app/helpers/slugify";

const domain = process.env.NEXT_PUBLIC_WP_URL;

// Dimensiones reales de public/imagen-de-portada.webp: sin ellas el fallback también
// provocaría CLS.
const FALLBACK_IMAGE: WpImage = {
    img: "https://www.sherpafoodtours.com/imagen-de-portada.webp",
    alt: "",
    width: 1441,
    height: 711,
};
const apiUrl = `${domain}/wp-json/wp/v2`

// WordPress corre en un hosting compartido que se queda sin conexiones a MySQL con unos
// 20 pedidos simultáneos: a partir de ahí /wp-json responde 500 "Database Error". Una
// sola página de ciudad dispara decenas de pedidos en paralelo, y varias regeneraciones
// ISR a la vez lo superan seguro. Este tope por instancia mantiene la carga por debajo.
const MAX_CONCURRENT_WP_REQUESTS = 6;
let activeWpRequests = 0;
const wpQueue: (() => void)[] = [];

async function withWpSlot<T>(task: () => Promise<T>): Promise<T> {
    if (activeWpRequests >= MAX_CONCURRENT_WP_REQUESTS) {
        await new Promise<void>((resolve) => wpQueue.push(resolve));
    }
    activeWpRequests++;
    try {
        return await task();
    } finally {
        activeWpRequests--;
        wpQueue.shift()?.();
    }
}

/**
 * WordPress no respondió (5xx, 429 o red) después de los reintentos. Es distinto de
 * "el recurso no existe": un 404 se degrada a vacío o al fallback, esto se propaga.
 * En una regeneración ISR, tirar hace que Next conserve la página anterior (que estaba
 * bien) y reintente después; tragárselo horneaba el placeholder en la página por horas.
 */
export class WpUnavailableError extends Error {
    constructor(url: string, detail: string) {
        super(`WordPress no disponible (${detail}) para ${url}`);
        this.name = "WpUnavailableError";
    }
}

// Tag de la Data Cache para todo lo que viene de WordPress: /api/revalidate lo invalida
// cuando se guarda contenido, así la página regenerada no se arma con respuestas de WP
// cacheadas de hasta dos horas. Sólo se agrega a los fetch que ya se cacheaban: ponerlo
// en los que no tenían `next` cambiaría cómo se cachean.
export const WP_CACHE_TAG = "wp";

async function wpFetch(url: string, options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }): Promise<Response> {
    const init = options?.next ? { ...options, next: { ...options.next, tags: [WP_CACHE_TAG] } } : options;
    let response: Response;
    try {
        response = await withWpSlot(() => fetchWithRetry(url, init, 3));
    } catch (error) {
        throw new WpUnavailableError(url, String(error));
    }
    if (response.status >= 500 || response.status === 429) {
        throw new WpUnavailableError(url, `HTTP ${response.status}`);
    }
    return response;
}

// Para los catch que degradan a vacío: un recurso que no existe se degrada, una caída
// de WordPress no.
function rethrowIfUnavailable(error: unknown) {
    if (error instanceof WpUnavailableError) throw error;
}

function normalizeWpImageUrl(url: string): string {
    if (!url || !url.includes('/wp-content/uploads/') || !domain) return url;
    try {
        const imgUrl = new URL(url);
        const wpUrl = new URL(domain);
        imgUrl.hostname = wpUrl.hostname;
        imgUrl.protocol = wpUrl.protocol;
        imgUrl.port = wpUrl.port;
        return imgUrl.toString();
    } catch {
        return url;
    }
}


// Slug de cada artículo → segmento de ciudad de su URL (el título de la ciudad pasado a
// slug, igual que en travel-guide/[city]/[slug]). Con esto wp-links manda los links
// internos directo a la URL canónica: cuando cambió el título de las ciudades, los ~50
// links a /travel-guide/<ciudad>/<articulo>/ quedaron pasando por un 308.
const ARTICLE_CITIES_TTL_MS = 10 * 60 * 1000;
let articleCitiesCache: { at: number; promise: Promise<Map<string, string>> } | null = null;

async function fetchArticleCities(): Promise<Map<string, string>> {
    const cities = new Map<string, string>();
    for (let page = 1; page < 20; page++) {
        const response = await wpFetch(`${apiUrl}/posts?per_page=100&page=${page}&_fields=slug,relaciones.ciudades`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) break; // 400 = no hay más páginas
        const posts: { slug: string; relaciones?: { ciudades?: { title?: string }[] } }[] = await response.json();
        for (const post of posts) {
            const title = post.relaciones?.ciudades?.[0]?.title;
            if (title) cities.set(post.slug, slugify(title));
        }
        if (posts.length < 100) break;
    }
    return cities;
}

type WPUser = { id: number; name: string; slug?: string; description?: string; [key: string]: unknown };

// Reemplazo del listado /users: sólo devuelve autores con artículos publicados, que es
// lo mismo que el listado público de WordPress y lo único que usan las páginas de autor
// y el sitemap.
async function fetchUsersFromPostAuthors(): Promise<WPUser[]> {
    const authorIds = new Set<number>();
    for (let page = 1; page < 20; page++) {
        // `_fields=author` solo también lo bloquea el firewall (regla anti-enumeración de
        // usuarios); con `id,author` pasa.
        const response = await wpFetch(`${apiUrl}/posts?per_page=100&page=${page}&_fields=id,author`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) break; // 400 = no hay más páginas
        const posts: { author?: number }[] = await response.json();
        for (const post of posts) {
            if (post.author) authorIds.add(post.author);
        }
        if (posts.length < 100) break;
    }

    const users = await Promise.all(
        [...authorIds].map(async (id) => {
            const response = await wpFetch(`${apiUrl}/users/${id}`, { next: { revalidate: 3600 } });
            return response.ok ? ((await response.json()) as WPUser) : null;
        })
    );
    return users.filter((user): user is WPUser => user !== null);
}

async function getArticleCities(): Promise<Map<string, string>> {
    if (!articleCitiesCache || Date.now() - articleCitiesCache.at > ARTICLE_CITIES_TTL_MS) {
        const promise = fetchArticleCities().catch((error) => {
            // Sin el mapa los links siguen funcionando, sólo con el salto de redirect.
            console.warn("No se pudo armar el mapa de ciudades de los artículos:", error);
            articleCitiesCache = null;
            return new Map<string, string>();
        });
        articleCitiesCache = { at: Date.now(), promise };
    }
    return articleCitiesCache.promise;
}

// Todo el HTML que WordPress devuelve pasa por acá antes de llegar a una página: las
// imágenes al optimizador y los links internos normalizados. Un solo punto para que una
// transformación futura no quede aplicada a la mitad de los getters.
async function limpiarContenido(content: string): Promise<string> {
    return rewriteInternalLinks(rewriteHtmlImages(content), await getArticleCities());
}

export const wp = {
    getPageInfo: async (slug: string) => {
        const url = `${apiUrl}/pages?slug=${slug}`;
        const response = await wpFetch(url, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`WordPress API error ${response.status} for ${url}`);
        }

        const [data] = await response.json();

        // Page genuinely doesn't exist
        if (!data) return { title: "", content: "", acf: "", featured_media: null };

        const { title: { rendered: title }, content: { rendered: content }, acf, featured_media } = data;
        return { title, content: await limpiarContenido(content), acf, featured_media };
    },
    getPostInfo: async (slug: string) => {
        // Optimizado: agregar cache para reducir llamadas a WordPress; _embed incluye autor
        const url = `${apiUrl}/posts?slug=${slug}&_embed`;
        const response = await wpFetch(url, {
            next: { revalidate: 3600 } // cachea por 1 hora
        });

        // Acá NO se degrada a vacío: quien llama hace notFound() con el resultado vacío, así
        // que tragarse un error de red convertiría un artículo publicado en un 404 horneado
        // en el build estático. Mejor romper ruidosamente y que el deploy no salga.
        if (!response.ok) {
            throw new Error(`WordPress API error ${response.status} for ${url}`);
        }

        const [data] = await response.json();
        if (!data) return { title: "", content: "", excerpt: "", featured_media: null, date: "", modified: "", relaciones: null, author: null, acf: null };


        const { title: { rendered: title }, content: { rendered: content }, excerpt: { rendered: excerpt }, featured_media, date, modified, relaciones, _embedded, acf } = data;
        const authorData = _embedded?.author?.[0];
        const author = authorData ? { name: authorData.name, slug: authorData.slug ?? null } : null;

        // acf viaja para que el articulo pueda leer metadata.title/description, el mismo
        // grupo que usan ciudades y tours. Mientras el grupo no este asignado al post type
        // "post" en ACF, llega vacio y la pagina cae al titulo y al excerpt como siempre.
        return { title, content: await limpiarContenido(content), excerpt, featured_media, date, modified, relaciones, author, acf };
    },
    getPostInfoById: async (id: number) => {
        const response = await wpFetch(`${apiUrl}/posts/${id}`)

        if (!response.ok) {
            console.error("No se obtuvieron datos")
            return { title: null, content: null, excerpt: null, featured_media: null, date: null, modified: null, relaciones: null, acf: null, author: null, slug: null }
        }

        const { title: { rendered: title }, content: { rendered: content }, excerpt: { rendered: excerpt }, featured_media, date, modified, relaciones, acf, author, slug } = await response.json();

        return { title, content: await limpiarContenido(content), excerpt, featured_media, date, modified, relaciones, acf, author, slug };
    },
    getAllPost: async (limit?: number, page?: number) => {
        try {
            let url = limit ? `${apiUrl}/posts?per_page=${limit}` : `${apiUrl}/posts?v=ass`;

            if (page) {
                url += `&page=${page}`;
            }

            // fetchWithRetry y no fetch pelado, como el resto de los getters: este es el
            // unico camino por el que los ~72 articulos entran al sitemap, y devolvia [] a
            // la primera. Un [] no se distingue de "no hay mas paginas", asi que el sitemap
            // se publicaba sin un solo articulo y sin que nada lo reportara.
            const response = await wpFetch(url, {
                next: { revalidate: 3600 } // cachea por 1 hora
            });

            if (!response.ok) {
                // 400 es lo que responde WP cuando se pide una pagina que no existe
                // (rest_post_invalid_page_number): ahi el [] es correcto y corta el loop.
                if (response.status !== 400) {
                    console.warn(`getAllPost: WordPress respondio ${response.status} para ${url}`);
                }
                return []; // Retornar array vacío en lugar de fallar
            }

            return await response.json();
        } catch (error) {
            console.warn('getAllPost error:', error);
            return []; // Retornar array vacío para no romper el build
        }
    },
    getAllPostPaginated: async (limit: number, page: number) => {
        try {
            const url = `${apiUrl}/posts?per_page=${limit}&page=${page}`;

            const response = await wpFetch(url);

            if (!response.ok) {
                console.warn(`Posts API failed: ${response.status} ${response.statusText}`);
                return []; // Retornar array vacío en lugar de fallar
            }

            return await response.json();
        } catch (error) {
            console.warn('getAllPostPaginated error:', error);
            return []; // Retornar array vacío para no romper el build
        }
    },
    getPostImage: async (id?: number): Promise<WpImage> => {
        if (!id || id === 0) {
            // Si no hay media, devolver imagen por defecto
            return { ...FALLBACK_IMAGE };
        }
        const url = `${apiUrl}/media/${id}`;
        // Optimizado: agregar cache para imágenes (muy usado, reduce CPU significativamente)
        // Si WordPress está caído, wpFetch tira y la página no se regenera con el
        // placeholder: era lo que hacía "desaparecer" fotos de tours y ciudades por horas.
        const response = await wpFetch(url, {
            next: { revalidate: 7200 } // cachea por 2 horas (las imágenes cambian menos)
        });

        // 404 y similares: la imagen se borró de la biblioteca, ahí sí va el fallback.
        if (!response.ok) {
            console.warn(`No se pudo obtener la imagen del post: HTTP ${response.status}`, url);
            return { ...FALLBACK_IMAGE };
        }

        const data = await response.json();
        if (!data.source_url) return { ...FALLBACK_IMAGE };
        return {
            img: normalizeWpImageUrl(data.source_url),
            alt: data.alt_text || "",
            width: data.media_details?.width,
            height: data.media_details?.height,
        };
    },

    getAllCategories: async () => {
        const response = await wpFetch(`${apiUrl}/categories`)

        if (!response.ok) throw new Error("No se obtuvieron datos");
        const data = await response.json();

        return data;
    },
    getAllTours: async () => {
        // Optimizado: agregar cache para reducir llamadas a WordPress
        const response = await wpFetch(`${apiUrl}/tours?per_page=100`, {
            next: { revalidate: 3600 } // cachea por 1 hora
        });

        if (!response.ok) throw new Error("No se obtuvieron datos");
        const data = await response.json();

        return data;
    },
    getCity: async (id: number) => {

        try {
            const url = `${apiUrl}/cities/${id}`;
            const response = await wpFetch(url);

            if (!response.ok) throw new Error(`No se obtuvieron datos ${url}`);
            const { title: { rendered: title }, acf: { pais: country_id }, slug } = await response.json();

            return { city_name: title, country_id: country_id, slug };
        } catch (error) {
            rethrowIfUnavailable(error);
            console.error(error);
            return { city_name: "", country_id: 0, slug: "" };
        }
    },
    getCountry: async (id: number) => {
        try {

            const url = `${apiUrl}/countries/${id}`;
            const response = await wpFetch(url)

            if (!response.ok) throw new Error(`No se obtuvieron datos ${url}`);
            const { title: { rendered: title } } = await response.json();

            return { country_name: title };
        } catch (error) {
            rethrowIfUnavailable(error);
            console.log({ error });

            return { country_name: "" }
        }
    },
    getEmbedSectionInfo: async (slug: string) => {
        try {
            const response = await wpFetch(`${apiUrl}/embedsections?slug=${slug}`, { next: { revalidate: 3600 } })
            if (!response.ok) throw new Error(`No se obtuvieron datos de ${apiUrl}/embedsections?slug=${slug}`);
            const [data] = await response.json();
            if (!data) throw new Error(`La sección ${slug} no existe`);
            const { title: { rendered: title }, content: { rendered: content }, featured_media, acf } = data;
            return { title, content: await limpiarContenido(content), featured_media, acf };
        } catch (err) {
            console.warn(`No se pudo obtener la sección ${slug}:`, err);
            return { title: "", content: "", featured_media: null, acf: null };
        }

    },
    getEmbedSectionInfoById: async (id: number) => {
        try {
            const url = `${apiUrl}/embedsections/${id}`;
            // Con fetch pelado, un 500 puntual de WP durante el prerender devolvía acf: null
            // y tumbaba el build. Reintentos + caché, igual que getCityBySlug y getTourBySlug.
            const response = await wpFetch(url, { next: { revalidate: 3600 } })
            if (!response.ok) throw new Error(`No se obtuvieron datos de ${apiUrl}/embedsections/${id}`);
            const { title: { rendered: title }, content: { rendered: content }, featured_media, acf } = await response.json();
            return { title, content: await limpiarContenido(content), featured_media, acf };
        } catch (err) {
            console.warn(`No se pudo obtener la sección ${id}:`, err);
            return { title: "", content: "", featured_media: null, acf: null };
        }

    },
    getAuthor: async (id: number) => {
        try {
            const response = await wpFetch(`${apiUrl}/users/${id}`);

            if (!response.ok) {
                console.warn(`⚠️ No se pudo obtener autor ID ${id}`);
                return { name: "Autor desconocido", slug: null }; // fallback
            }

            // El slug real de WP: los bylines lo necesitan para enlazar a /author/<slug>/
            // en vez de derivarlo del nombre (que generaba slugs con acentos).
            const { name, slug } = await response.json();
            return { name, slug: slug ?? null };

        } catch (e) {
            rethrowIfUnavailable(e);
            console.warn(`⚠️ Error getAuthor(${id}):`, e);
            return { name: "Autor desconocido", slug: null };
        }
    },
    getTourById: async (id: number) => {
        try {

            const url = `${apiUrl}/tours/${id}`
            const response = await wpFetch(url)

            if (!response.ok) throw new Error(`No se obtuvieron datos ${url}`);

            const { title: { rendered: title }, content: { rendered: content }, featured_media, acf, slug } = await response.json();

            return { title, content: await limpiarContenido(content), featured_media, acf, slug }
        } catch (error) {
            // Un tour privado o borrado (4xx) se filtra en la página; una caída de WP
            // no: devolver vacío acá hacía desaparecer la card entera hasta la próxima
            // regeneración.
            rethrowIfUnavailable(error);
            console.error(error);
            return { title: "", content: "", featured_media: null, acf: null, slug: "" };

        }
    },
    getCityBySlug: async (slug: string) => {
        const url = `${apiUrl}/cities?slug=${slug}`;
        const response = await wpFetch(url, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`WordPress API error ${response.status} for ${url}`);
        }

        const [data] = await response.json();

        // City genuinely doesn't exist
        if (!data) {
            return { city_name: "", content: "", country_id: 0, acf: null, featured_media: null };
        }

        const { title: { rendered: title }, content: { rendered: content }, acf: { pais: country_id }, acf, featured_media } = data;
        return { city_name: title, content: await limpiarContenido(content), country_id: country_id, acf, featured_media };
    },

    getFaqById: async (id: number) => {
        const response = await wpFetch(`${apiUrl}/faq/${id}`);
        if (!response.ok) throw new Error("No se obtuvieron datos");
        const { acf } = await response.json();
        return { acf }
    },

    getTourBySlug: async (slug: string) => {
        const url = `${apiUrl}/tours?slug=${slug}`;
        const response = await wpFetch(url, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`WordPress API error ${response.status} for ${url}`);
        }

        const [data] = await response.json();

        // Tour genuinely doesn't exist
        if (!data) {
            return { title: "", acf: null };
        }

        const { title: { rendered: title }, acf } = data;
        return { title, acf };
    },

    getAllCities: async () => {
        try {

            const response = await wpFetch(`${apiUrl}/cities?per_page=100`, {
                next: { revalidate: 3600 } // cachea por 1 hora
            });
            if (!response.ok) throw new Error("No se obtuvieron datos");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getPostsByCategory: async (id: number, limit = 100, offset = 0) => {
        try {
            const url = `${apiUrl}/posts?categories=${id}&per_page=${limit}&offset=${offset}`;
            console.log({ url });
            const response = await wpFetch(url);
            if (!response.ok) {
                console.warn(`Posts by category API failed: ${response.status} ${response.statusText}`);
                return { ok: false, data: [] };
            }
            const data = await response.json();
            return { ok: true, data };
        } catch (error) {
            console.error("Error fetching posts by category:", error);
            return { ok: false, data: [] };
        }
    },

    // ok:false significa "WP falló"; ok:true con data:[] significa "el autor no tiene posts".
    // La distinción importa: author/[user] devuelve 404 en el segundo caso y 500 en el primero.
    getPostsByAuthorId: async (id: number, limit = 10, offset = 0) => {
        try {
            // El orden de los parametros no es casual: cambia la URL, y con eso la clave
            // de la Data Cache de Next, que en Vercel persiste entre deploys. Este fetch iba
            // sin opciones, asi que un [] devuelto alguna vez (200 vacio, no un error) quedo
            // cacheado para siempre y el sitemap salia sin autores aunque WordPress ya
            // contestara bien. Replicada la misma logica con fetch pelado: 4 autores.
            // No se usa _fields porque las paginas de autor renderizan estos posts enteros.
            const url = `${apiUrl}/posts?per_page=${limit}&offset=${offset}&author=${id}`;
            const response = await wpFetch(url, {
                next: { revalidate: 3600 }
            });
            if (!response.ok) {
                console.warn(`⚠️ No se pudieron obtener posts del autor ${id}: ${response.status}`);
                return { ok: false as const, data: null };
            }
            const data = await response.json();
            if (!Array.isArray(data)) return { ok: false as const, data: null };
            return { ok: true as const, data };
        } catch (error) {
            console.error(error)
            return { ok: false as const, data: null }
        }
    },

    getAllUsers: async () => {
        try {
            // Optimizado: agregar cache para reducir llamadas a WordPress
            // fetchWithRetry por lo mismo que getAllPost: este getter alimenta las paginas
            // de autor del sitemap, y un 500 intermitente de WordPress en el momento de
            // regenerarlo lo dejaba sin autores por una hora, sin avisar.
            const url = `${apiUrl}/users`;
            const response = await wpFetch(url, {
                next: { revalidate: 3600 } // cachea por 1 hora
            });
            if (response.status === 401 || response.status === 403) {
                // Desde ~18/11/2026 el firewall de Hostinger (LiteSpeed) bloquea el listado
                // /users con 403, pero deja pasar /users/{id}. Sin este camino, cada deploy
                // dejaba las páginas de autor en 500 y el sitemap sin autores.
                console.warn(`⚠️ /users respondió ${response.status}: se arman los autores desde los posts`);
                const data = await fetchUsersFromPostAuthors();
                return data.length ? { ok: true as const, data } : { ok: false as const, data: null };
            }
            if (!response.ok) {
                console.warn(`⚠️ No se pudieron obtener los usuarios: ${response.status}`);
                return { ok: false as const, data: null };
            }
            const data = await response.json();
            if (!Array.isArray(data)) return { ok: false as const, data: null };
            return { ok: true as const, data };
        } catch (error) {
            return { ok: false as const, data: null }
        }
    },

    getUserBySlug: async (slug: string) => {
        try {
            const url = `${apiUrl}/users?slug=${slug}`;
            const response = await wpFetch(url);
            if (!response.ok) return { ok: false, data: null };
            const data = await response.json();
            return { ok: true, data: data.length > 0 ? data[0] : null };
        } catch (error) {
            return { ok: false, data: null };
        }
    },
    getUserById: async (id: number) => {
        try {
            const url = `${apiUrl}/users/${id}`;
            const response = await wpFetch(url);
            if (!response.ok) return { ok: false, data: null };
            const data = await response.json();
            return { ok: true, data };
        } catch (error) {
            return { ok: false, data: null };
        }
    },
    
    getPostsByPostsId: async (ids: number[]) => {
        try {
          if (!ids.length) return { ok: true, data: [] };
      
          const url = `${apiUrl}/posts?include=${ids.join(",")}&_embed&per_page=100`;
          const response = await wpFetch(url);
      
          if (!response.ok) throw new Error("Error fetching posts by ids");
      
          const data = await response.json();
      
          // ✅ Reordenamos según el orden original
          const orderedData = ids
            .map(id => data.find((post: any) => post.id === id))
            .filter(Boolean);
      
          return { ok: true, data: orderedData };
        } catch (error) {
          return { ok: false, data: [] };
        }
      },
    getPostsIdsByCityId: async (id: number) => {
        try {
          const url = `${apiUrl}/cities/${id}`;
          console.log({ url });
          const response = await wpFetch(url);
      
          if (!response.ok) throw new Error("Error fetching posts by city");
      
          const data = await response.json();

          const ids = data.posts.map((p: any) => p.id);

      
          return { ok: true, data: ids };
        } catch (error) {
          return { ok: false, data: [] };
        }
      },

      getPostsBySearch: async (search: string) => {
        try {
          const url = `${apiUrl}/posts?search=${search}&_embed&per_page=100`;
          const response = await wpFetch(url);
          
          if (!response.ok) {
            console.warn(`Posts by search API failed: ${response.status} ${response.statusText}`);
            return { ok: false, data: [] };
          }
          
          const data = await response.json();
          return { ok: true, data };
        } catch (error) {
          console.error("Error fetching posts by search:", error);
          return { ok: false, data: [] };
        }
      },

      getMarqueeBanner: async () => {
        try {
          const url = `${apiUrl}/banner`;
          const response = await wpFetch(url);
          const data = await response.json();
          return { ok: true, data };
        } catch (error) {
          return { ok: false, data: null };
        }
      }


}