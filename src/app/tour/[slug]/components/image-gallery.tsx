
"use client";

import { Image, ChevronLeft, ChevronRight } from "lucide-react";
import "../../../../ui/components/css/image-gallery.css";
import { useState, useEffect } from "react";
import { optimizedUrl, optimizedSrcSet, type WpImage } from "@/lib/wp-media";

// La galeria es un grid de 2 filas iguales (alto fijo: 450px, 500px desde 460px, 600px
// desde 1024px) con gap de .3rem. Desde 768px tiene 4 columnas: la primera foto ocupa 2
// columnas y las 2 filas, la segunda 2 columnas y las dos ultimas 1 cada una. En mobile
// son 2 columnas con la primera a todo el ancho (la cuarta queda display:none). El
// contenedor es .tour-hero-section: 1.3rem de padding por lado, max-width 600px en mobile
// y 1200px desde 1024px.
//
// Las fotos van con object-fit: cover, y ahi estaba el problema de la hero: la caja de
// desktop es casi cuadrada (577x600) y las fotos son horizontales 3:2, asi que la foto se
// escala hasta cubrir los 600px de alto y se dibuja a ~900px de ancho (se recortan los
// costados). Si `sizes` declara el ancho de la caja (577px), el browser baja una imagen
// de 640 y la estira 1.5x. Por eso `sizes` se calcula con el ancho que la foto ocupa
// despues del cover: max(ancho de la caja, alto de la caja x proporcion de la foto).

const GAP = 4.8;
const PADDING_X = 41.6;

// Ancho lineal en funcion del viewport: px = a * vw + b.
type Linear = { a: number; b: number };

type Breakpoint = { minVw: number; maxVw: number; content: Linear; gridHeight: number; columns: 2 | 4 };

// De mayor a menor: el primer media query que coincide gana.
const BREAKPOINTS: Breakpoint[] = [
    { minVw: 1200, maxVw: 1200, content: { a: 0, b: 1200 - PADDING_X }, gridHeight: 600, columns: 4 },
    { minVw: 1024, maxVw: 1199, content: { a: 1, b: -PADDING_X }, gridHeight: 600, columns: 4 },
    { minVw: 768, maxVw: 1023, content: { a: 1, b: -PADDING_X }, gridHeight: 500, columns: 4 },
    { minVw: 600, maxVw: 767, content: { a: 0, b: 600 - PADDING_X }, gridHeight: 500, columns: 2 },
    { minVw: 460, maxVw: 599, content: { a: 1, b: -PADDING_X }, gridHeight: 500, columns: 2 },
    { minVw: 0, maxVw: 459, content: { a: 1, b: -PADDING_X }, gridHeight: 450, columns: 2 },
];

// Las fotos de los tours son casi todas 3:2; se usa si WordPress no manda dimensiones.
const DEFAULT_ASPECT = 3 / 2;

function span(content: Linear, columns: number): Linear {
    const gaps = (columns - 1) * GAP;
    return { a: content.a / columns, b: (content.b - gaps) / columns };
}

function slotBox(slot: number, bp: Breakpoint): { width: Linear; height: number } {
    const row = (bp.gridHeight - GAP) / 2;
    const col = span(bp.content, bp.columns);
    const half = span(bp.content, 2);

    if (bp.columns === 2) {
        return slot === 0 ? { width: bp.content, height: row } : { width: col, height: row };
    }
    if (slot === 0) return { width: half, height: bp.gridHeight };
    if (slot === 1) return { width: half, height: row };
    return { width: col, height: row };
}

const evalAt = ({ a, b }: Linear, vw: number) => a * vw + b;

// b se redondea para abajo: sobreestimar un par de px es mejor que quedarse corto.
const toCss = ({ a, b }: Linear) =>
    a === 0 ? `${Math.ceil(b)}px` : `calc(${a * 100}vw - ${Math.floor(-b)}px)`;

function gallerySizes(slot: number, aspect: number): string {
    const entry = (minVw: number, value: string) => (minVw > 0 ? `(min-width: ${minVw}px) ${value}` : value);

    const parts = BREAKPOINTS.flatMap((bp) => {
        const { width, height } = slotBox(slot, bp);
        const coverWidth = height * aspect;
        const minWidth = evalAt(width, bp.minVw);
        const maxWidth = evalAt(width, bp.maxVw);

        if (coverWidth >= maxWidth) return [entry(bp.minVw, `${Math.ceil(coverWidth)}px`)];
        if (coverWidth <= minWidth) return [entry(bp.minVw, toCss(width))];

        // En el medio del rango cambia quien manda: con viewports chicos el alto (la foto
        // desborda a los costados) y con grandes el ancho. Se parte donde se cruzan.
        const crossover = Math.ceil((coverWidth - width.b) / width.a);
        return [entry(crossover, toCss(width)), entry(bp.minVw, `${Math.ceil(coverWidth)}px`)];
    });
    return parts.join(", ");
}

// La hero en desktop retina necesita ~1800px: sin 1920 el browser se queda con 1200.
const GALLERY_SRCSET_WIDTHS = [384, 640, 828, 1080, 1200, 1920];

// width/height del <img> solo fijan la proporcion antes de que cargue el CSS.
const SLOT_ATTRS = [
    { width: 577, height: 600 },
    { width: 577, height: 298 },
    { width: 286, height: 298 },
] as const;

export default function ImageGallery({ images }: { images: WpImage[] }) {

    console.log({ images });

    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openGallery = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeGallery = () => {
        setIsOpen(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeGallery();
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div className="image-gallery">
            {images && images.slice(0, 4).map((image, i) => {
                // La cuarta foto mide igual que la tercera.
                const slot = Math.min(i, SLOT_ATTRS.length - 1);
                const aspect = image.width && image.height ? image.width / image.height : DEFAULT_ASPECT;

                return (
                    <div key={image.img + i} className="image-item" onClick={() => openGallery(i)}>
                        <img
                            src={optimizedUrl(image.img, i === 0 ? 1200 : 640)}
                            srcSet={optimizedSrcSet(image.img, GALLERY_SRCSET_WIDTHS)}
                            sizes={gallerySizes(slot, aspect)}
                            alt={image.alt || 'Tour Image'}
                            width={SLOT_ATTRS[slot].width}
                            height={SLOT_ATTRS[slot].height}
                            // La primera foto esta arriba de todo: es el LCP de la pagina.
                            loading={i === 0 ? "eager" : "lazy"}
                            fetchPriority={i === 0 ? "high" : undefined}
                            decoding="async"
                        />
                    </div>
                );
            })}
            <div className="total-images" onClick={() => openGallery(0)}>
                <Image />
                <p>{images.length}</p>
            </div>

            {isOpen && (
                <div className="lightbox" onClick={closeGallery}>
                    <button
                        className="close"
                        onClick={closeGallery}
                        aria-label="Close gallery"
                    >
                        ✕
                    </button>

                    <button
                        className="nav-button prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={40} />
                    </button>

                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={optimizedUrl(images[currentIndex].img, 1920)}
                            alt={images[currentIndex].alt || "Tour Image"}
                            width="1200"
                            height="800"
                            loading="lazy"
                            decoding="async"
                        />

                        {/* <div className="counter-container">
                            <div className="image-counter">
                                {currentIndex + 1} / {images.length}
                            </div>

                            <div className="pagination-dots">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`dot ${i === currentIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentIndex(i)}
                                        aria-label={`Go to image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div> */}
                    </div>

                    <button
                        className="nav-button next"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        aria-label="Next image"
                    >
                        <ChevronRight size={40} />
                    </button>
                </div>
            )}
        </div>
    )
}