import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";
import { WP_CACHE_TAG } from "@/lib/wp";

// Revalidación on-demand: WordPress llama acá cuando se publica, edita o despublica algo
// (snippet en docs/wordpress-revalidate-snippet.php) y la página se regenera en la
// próxima visita en vez de esperar su revalidate (hasta 24 horas en tours y artículos).
// No reemplaza un deploy: sólo refresca contenido del CMS con el código ya publicado.
//
//   POST /api/revalidate
//   x-revalidate-secret: <REVALIDATE_SECRET>
//   { "type": "post", "slug": "rio-de-janeiro-food" }   un artículo
//   { "type": "tours", "slug": "..." }                    cualquier otro tipo
//   { "scope": "all" }                                    todo el sitio
//
// Si WordPress falla mientras se regenera, la página anterior se conserva (ver
// WpUnavailableError en src/lib/wp.ts): revalidar nunca deja una página rota.

function authorized(req: NextRequest): boolean {
    const expected = process.env.REVALIDATE_SECRET;
    const received = req.headers.get("x-revalidate-secret");
    if (!expected || !received) return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
    if (!process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET no está configurado" }, { status: 500 });
    }
    if (!authorized(req)) {
        return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    let body: { type?: string; slug?: string; scope?: string } = {};
    try {
        body = await req.json();
    } catch {
        // Sin body = todo el sitio.
    }

    // Los datos de WordPress primero: si no, la página regenerada se armaría con las
    // respuestas cacheadas de antes del cambio.
    revalidateTag(WP_CACHE_TAG, { expire: 0 });

    const revalidated: string[] = [];
    const path = (p: string, type?: "page" | "layout") => {
        revalidatePath(p, type);
        revalidated.push(type ? `${p} (${type})` : p);
    };

    if (body.scope !== "all" && body.type === "post") {
        // Un artículo aparece en su página, en el índice del travel guide, en la home, en
        // las ciudades y en su autor. Las rutas dinámicas se revalidan por patrón porque la
        // ciudad del artículo sale del título de la ciudad en WP y no viaja en el aviso.
        path("/travel-guide/[city]/[slug]", "page");
        path("/travel-guide");
        path("/");
        path("/city/[slug]", "page");
        path("/author/[user]", "page");
        path("/sitemap.xml");
    } else {
        // Tours, ciudades, páginas, secciones, banner, media, FAQs: aparecen en el navbar,
        // el footer y en varias páginas a la vez. Se revalida todo el árbol; cada página se
        // regenera recién cuando alguien la visita, así que no hay pico de carga en WP.
        path("/", "layout");
    }

    return NextResponse.json({ ok: true, type: body.type ?? null, slug: body.slug ?? null, revalidated });
}
