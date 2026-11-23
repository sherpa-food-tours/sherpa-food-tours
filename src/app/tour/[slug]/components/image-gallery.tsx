
"use client";

import { Image, ChevronLeft, ChevronRight } from "lucide-react";
import "../../../../ui/components/css/image-gallery.css";
import { useState, useEffect } from "react";
import { optimizedUrl, optimizedSrcSet } from "@/lib/wp-media";

// La galeria es un grid de 4 columnas desde 768px: la primera foto ocupa 2 columnas y 2
// filas, la segunda 2 columnas y las dos ultimas 1 cada una. En mobile son 2 columnas con
// la primera a todo el ancho (la cuarta queda display:none). El contenedor es
// .tour-hero-section: 1.3rem de padding por lado, max-width 600px en mobile y 1200px desde
// 1024px. Con el gap de .3rem, en un grid de 1200 las columnas miden 286px y la foto
// grande 577px: de ahi salen estos sizes, y de ahi venia el problema (se pedian 384px de
// ancho para cajas de 577, el doble en pantallas retina).
const GALLERY_SLOTS = [
    {
        sizes: "(min-width: 1200px) 577px, (min-width: 768px) calc(50vw - 23px), (min-width: 600px) 558px, calc(100vw - 42px)",
        width: 577,
        height: 600,
    },
    {
        sizes: "(min-width: 1200px) 577px, (min-width: 768px) calc(50vw - 23px), (min-width: 600px) 277px, calc(50vw - 23px)",
        width: 577,
        height: 298,
    },
    {
        sizes: "(min-width: 1200px) 286px, (min-width: 768px) calc(25vw - 14px), (min-width: 600px) 277px, calc(50vw - 23px)",
        width: 286,
        height: 298,
    },
] as const;

export default function ImageGallery({ images }: { images: { img: string; alt: string }[] }) {

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
                const slot = GALLERY_SLOTS[Math.min(i, GALLERY_SLOTS.length - 1)];

                return (
                    <div key={image.img + i} className="image-item" onClick={() => openGallery(i)}>
                        <img
                            src={optimizedUrl(image.img, slot.width)}
                            srcSet={optimizedSrcSet(image.img)}
                            sizes={slot.sizes}
                            alt={image.alt || 'Tour Image'}
                            width={slot.width}
                            height={slot.height}
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