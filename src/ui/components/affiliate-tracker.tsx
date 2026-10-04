"use client";

import { useEffect } from "react";
import { captureAffiliateFromUrl, withAffiliateRef } from "@/lib/affiliate";

/**
 * Lee el código de afiliado al entrar y lo inyecta en cada link de FareHarbor justo antes
 * de que se abra el checkout.
 *
 * Se hace con un listener en fase de captura y no link por link porque los links a
 * FareHarbor salen de muchos lados: BookNowButton (que arma un <a> temporal en el click),
 * el navbar, las cards y los links que los editores pegan en el cuerpo de los artículos.
 * El script de FareHarbor (autolightframe) intercepta esos clicks para abrir el lightframe;
 * la captura en window corre antes, así que cuando lo lee el href ya trae el código.
 */
export default function AffiliateTracker() {
    useEffect(() => {
        captureAffiliateFromUrl();

        function onClick(event: MouseEvent) {
            const anchor = (event.target as Element | null)?.closest?.("a[href*='fareharbor.com']");
            if (!(anchor instanceof HTMLAnchorElement)) return;
            const href = withAffiliateRef(anchor.href);
            if (href !== anchor.href) anchor.href = href;
        }

        window.addEventListener("click", onClick, true);
        return () => window.removeEventListener("click", onClick, true);
    }, []);

    return null;
}
