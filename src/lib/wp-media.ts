// Las imágenes de WordPress se sirven desde el WP headless (staging), que responde
// `x-robots-tag: noindex, nofollow, noarchive` en cada archivo. Google tiene prohibido
// indexarlas, y por eso Lens atribuye las fotos de Sherpa a Instagram o Viator.
//
// Pasarlas por el optimizador de Next las re-emite desde el dominio público con headers
// propios, sin ese noindex, y además comprimidas. Este módulo construye esas URLs.

const SITE_ORIGIN = "https://www.sherpafoodtours.com";

/**
 * Imagen que viene de WordPress. width/height son las dimensiones reales del archivo:
 * van como atributos en el <img> para fijar el aspect-ratio y evitar CLS, no como
 * tamaño de render (de eso se ocupa el CSS).
 */
export type WpImage = {
    img: string;
    alt: string;
    width?: number;
    height?: number;
};

// El optimizador solo acepta los anchos declarados en images.deviceSizes + images.imageSizes
// de next.config.ts, y solo quality 75 (images.qualities). Cualquier otro valor da 400.
const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];
export const IMAGE_QUALITY = 75;

/** Redondea al ancho permitido más chico que cubra el pedido. */
export function snapWidth(width: number): number {
    return ALLOWED_WIDTHS.find((w) => w >= width) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/** ¿Es un archivo servido por el WordPress headless? */
export function isWpMedia(url: string): boolean {
    return typeof url === "string" && url.includes("/wp-content/uploads/");
}

/**
 * ¿Lo puede procesar el optimizador? En uploads también hay videos (.mp4, .mov) y PDFs:
 * mandados a /_next/image devuelven 400 y el video del artículo no se reproduce.
 */
export function isOptimizableImage(url: string): boolean {
    return /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(url.split(/[?#]/)[0]);
}

// remotePatterns solo acepta https: una URL http:// de WordPress devuelve 400 en el
// optimizador. Hay artículos viejos que todavía las tienen en el contenido.
function forceHttps(url: string): string {
    return isWpMedia(url) ? url.replace(/^http:\/\//i, "https://") : url;
}

// Los srcset de WordPress llegan hasta 2560w (las "-scaled"). Como el optimizador no
// sirve más de 1920, esos candidatos serían copias de 1920 declaradas como más grandes.
const MAX_SRCSET_WIDTH = 1920;

/**
 * URL del optimizador para una imagen. Lleva barra final a propósito: con
 * `trailingSlash: true`, pedir `/_next/image?...` devuelve un 308 y agrega un salto
 * de red por imagen.
 */
export function optimizedUrl(src: string, width?: number): string;
export function optimizedUrl(src: string | undefined, width?: number): string | undefined;
export function optimizedUrl(src: string | undefined, width = 1200): string | undefined {
    // Sin src no hay nada que optimizar, y `url=` vacío devuelve 400.
    if (!src) return src;
    // Idempotente: si ya apunta al optimizador, no lo envuelve de nuevo.
    if (src.startsWith("/_next/image")) return src;
    return `/_next/image/?url=${encodeURIComponent(forceHttps(src))}&w=${snapWidth(width)}&q=${IMAGE_QUALITY}`;
}

/** Igual que optimizedUrl pero absoluta, para og:image, twitter:image y JSON-LD. */
export function absoluteOptimizedUrl(src: string, width = 1200): string {
    if (!src) return src;
    if (!isWpMedia(src)) return src.startsWith("/") ? `${SITE_ORIGIN}${src}` : src;
    return `${SITE_ORIGIN}${optimizedUrl(src, width)}`;
}

/**
 * Reescribe los <img> del HTML que llega de WordPress para que apunten al optimizador.
 * `next/image` no sirve acá: el contenido entra como string a dangerouslySetInnerHTML.
 *
 * Reescribe también srcset — si solo se cambiara src, el browser seguiría eligiendo del
 * srcset y bajando la imagen desde staging.
 */
export function rewriteHtmlImages(html: string): string {
    if (!html) return html;

    // srcset: "<url> 300w, <url> 768w" — cada candidato apunta al optimizador con su ancho.
    const withSrcset = html.replace(
        /\bsrcset=(["'])(.*?)\1/gi,
        (match, quote: string, value: string) => {
            if (!isWpMedia(value)) return match;
            const candidates = value.split(",").map((candidate) => {
                const parts = candidate.trim().split(/\s+/);
                const descriptor = parts[1];
                const width = descriptor?.endsWith("w") ? parseInt(descriptor, 10) : NaN;
                return { raw: candidate.trim(), url: parts[0], descriptor, width };
            });
            // Se descartan los candidatos de más de 1920w, salvo que no quede ninguno.
            const fitting = candidates.filter((c) => Number.isNaN(c.width) || c.width <= MAX_SRCSET_WIDTH);
            const rewritten = (fitting.length > 0 ? fitting : candidates)
                .map(({ raw, url, descriptor, width }) => {
                    if (!url || !isWpMedia(url)) return raw;
                    return `${optimizedUrl(url, Number.isNaN(width) ? 1200 : width)}${descriptor ? ` ${descriptor}` : ""}`;
                })
                .join(", ");
            return `srcset=${quote}${rewritten}${quote}`;
        }
    );

    // src suelto (y los data-* que usa el lazy load de WP para rehidratar el src), más el
    // poster de los <video>. Lo que no es imagen (el src de un <video> o <source>) queda
    // apuntando a WordPress en https: el optimizador no sirve video.
    return withSrcset.replace(
        /\b(src|data-src|data-full-url|data-large-file|poster)=(["'])(https?:\/\/[^"']*\/wp-content\/uploads\/[^"']*)\2/gi,
        (_match, attr: string, quote: string, url: string) =>
            `${attr}=${quote}${isOptimizableImage(url) ? optimizedUrl(url) : forceHttps(url)}${quote}`
    );
}
