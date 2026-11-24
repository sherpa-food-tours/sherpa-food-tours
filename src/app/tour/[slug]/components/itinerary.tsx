"use client";

import type { Itinerary } from "@/types/itinerary";
import { useEffect, useRef } from "react";
import { optimizedUrl, optimizedSrcSet, type WpImage } from "@/lib/wp-media";

// .stop-item-img solo se ve por debajo de 460px (arriba queda display:none). Es una caja
// vertical (aspect-ratio 3/4) con max-height 300px, que tambien le limita el ancho: mide
// 225x300 en cualquier celular. Con object-fit: cover una foto horizontal se dibuja mas
// ancha que la caja (3:2 -> 450px), y `sizes` tiene que declarar ese ancho, no el de la
// caja: si no, el browser baja una imagen chica y la estira.
const STOP_IMG_BOX = { width: 225, height: 300 };

function stopImgSizes(image: WpImage): string {
    const aspect = image.width && image.height ? image.width / image.height : 3 / 2;
    return `${Math.ceil(Math.max(STOP_IMG_BOX.width, STOP_IMG_BOX.height * aspect))}px`;
}

const STOP_IMG_SRCSET_WIDTHS = [384, 640, 828, 1080, 1200, 1920];

export default function ItineraryComponent({ itinerary, desktopImgs }: { itinerary: Itinerary; desktopImgs: { img: string; alt: string }[] }) {

    console.log({ itinerary, desktopImgs });

    const refs = useRef<(HTMLDivElement | null)[]>([]);
    const desktopImageLayouts = [
        { top: "1%", left: "11%", rotate: "-8deg", width: "52%" },
        { top: "26%", right: "6%", rotate: "11deg", width: "26%" },
        { top: "54%", left: "16%", rotate: "-5deg", width: "46%" },
    ] as const;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("opacity");
                    } else {
                        entry.target.classList.remove("opacity");
                    }
                });
            },
            {
                threshold: 0.5, // porcentaje visible del elemento para disparar
            }
        );

        refs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            const currentRefs = refs.current;
            currentRefs.forEach((el) => {
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    return (
        <section className="itinerary-section">
            <div className="itinerary-container md:!overflow-visible">
                <h2 className="itinerary-title"> {itinerary.title}</h2>
                <div className="itinerary-container-elements">
                    <div className="itinerary-steps-container">
                        {itinerary.items.map((item, index) => (
                            <div className="itinerary-step" key={item.title + index} ref={(el) => { refs.current[index] = el }}>
                                <p className="itinerary-step-title">{item.title}</p>

                                {/* Solo para START y END */}
                                {item.information &&
                                    <div className="itinerary-step-information">
                                        <img src={optimizedUrl(item?.map?.img || "/icons/map-pin.png", 64)} alt={item?.map?.alt || "Map pin icon"} width="24" height="24" className="object-contain"/>
                                        <div className="itinerary-step-data" dangerouslySetInnerHTML={{ __html: item.information }}>
                                        </div>
                                    </div>
                                }

                                {item.subtitle && <p className="itinerary-step-subtitle">{item.subtitle}</p>}

                                <div className="stop-items-container">
                                    {item.items.map((internal_item, i) => (
                                        internal_item.title ?
                                            <div className="stop-item" key={internal_item.title}>
                                                <div className="stop-item-text" dangerouslySetInnerHTML={{ __html: internal_item.title }}></div>
                                                {internal_item.mobile_img &&
                                                    <div className="stop-item-img">
                                                        <img
                                                            src={optimizedUrl(internal_item.mobile_img.img, 828)}
                                                            srcSet={optimizedSrcSet(internal_item.mobile_img.img, STOP_IMG_SRCSET_WIDTHS)}
                                                            sizes={stopImgSizes(internal_item.mobile_img)}
                                                            alt={internal_item.mobile_img.alt}
                                                            width="400"
                                                            height="300"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>
                                                }
                                            </div>
                                            : <p className="stop-item" key={internal_item.title + i}>&nbsp;</p>
                                    ))}
                                </div>

                            </div>
                        ))}
                    </div>
                    <div className="relative hidden md:block md:w-1/2 md:overflow-visible">
                        <div className="relative h-full w-full overflow-visible">
                            {desktopImgs.map((element, i) => {
                                const layout = desktopImageLayouts[i % desktopImageLayouts.length];
                                // Las fotos rotadas viven en la mitad derecha del
                                // .itinerary-container (max-width 1200px con 1.3rem de
                                // padding por lado, o sea 579px de mitad) y cada una ocupa
                                // el porcentaje de arriba.
                                const widthRatio = parseInt(layout.width, 10) / 100;
                                const sizes = `(min-width: 1200px) ${Math.round(579 * widthRatio)}px, ${Math.round(50 * widthRatio)}vw`;

                                return (
                                    <div
                                        className="absolute shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
                                        key={element.img + i}
                                        style={{
                                            top: layout.top,
                                            left: "left" in layout ? layout.left : undefined,
                                            right: "right" in layout ? layout.right : undefined,
                                            width: layout.width,
                                            transform: `rotate(${layout.rotate})`,
                                            zIndex: i + 1,
                                        }}
                                    >
                                        <img
                                            src={optimizedUrl(element.img, 640)}
                                            srcSet={optimizedSrcSet(element.img)}
                                            sizes={sizes}
                                            alt={element.alt}
                                            width="600"
                                            height="400"
                                            loading="lazy"
                                            decoding="async"
                                            className="block h-auto w-full object-cover"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
