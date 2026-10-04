// Tracking de afiliados (Trello #34).
//
// Los afiliados linkeaban directo al checkout de FareHarbor, así que el visitante nunca
// pasaba por el sitio. Ahora linkean al sitio con un código propio:
//
//   https://www.sherpafoodtours.com/?online_booking_reference=travelblog
//
// y el sitio hace tres cosas: lee el código al entrar, lo recuerda en una cookie mientras
// el visitante navega, y lo inyecta en el link de FareHarbor cuando abre el checkout. La
// reserva queda etiquetada con el código y Sherpa liquida comisiones filtrando por ese
// valor en los reportes de FareHarbor.

/** Parámetro con el que llega el afiliado al sitio. */
export const AFFILIATE_PARAM = "online_booking_reference";

/**
 * Parámetro con el que FareHarbor recibe el código en sus links de embeds. Si los reportes
 * no lo muestran después de una reserva de prueba, este es el único valor a cambiar.
 */
export const FAREHARBOR_REF_PARAM = "ref";

const COOKIE_NAME = "sherpa_affiliate";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

// El código termina en una cookie y en una URL de terceros: sólo letras, números, guion y
// guion bajo, y con largo acotado. Cualquier otra cosa se descarta.
function sanitize(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && /^[A-Za-z0-9_-]{1,64}$/.test(trimmed) ? trimmed : null;
}

/** Si la URL actual trae un código de afiliado, lo guarda. El último afiliado gana. */
export function captureAffiliateFromUrl(): void {
    const ref = sanitize(new URLSearchParams(window.location.search).get(AFFILIATE_PARAM));
    if (!ref) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${ref}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export function getAffiliateRef(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    return sanitize(match?.[1]);
}

/** Agrega el código del afiliado a una URL de FareHarbor. Cualquier otra URL queda igual. */
export function withAffiliateRef<T extends string | null | undefined>(url: T): T {
    const ref = getAffiliateRef();
    if (!url || !ref) return url;
    try {
        const parsed = new URL(url);
        if (!/(^|\.)fareharbor\.com$/i.test(parsed.hostname)) return url;
        // Se edita el string y no searchParams: searchParams.set re-codifica la query entera
        // y el ga4t que FareHarbor parsea (comas, punto y coma, back=https://…) cambiaría.
        const [base, hash = ""] = url.split("#");
        const param = new RegExp(`([?&])${FAREHARBOR_REF_PARAM}=[^&]*`);
        const withRef = param.test(base)
            ? base.replace(param, `$1${FAREHARBOR_REF_PARAM}=${ref}`)
            : `${base}${base.includes("?") ? "&" : "?"}${FAREHARBOR_REF_PARAM}=${ref}`;
        return (hash ? `${withRef}#${hash}` : withRef) as T;
    } catch {
        return url;
    }
}
