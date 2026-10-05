"use client";

import BookNowButton from "@/ui/components/book-now";
import { useRef, useState } from "react";
import Calendar from "./calendar";


// calendarLink es el mismo widget de FareHarbor que muestra el calendario de desktop. Antes
// no se pasaba: en mobile (el único lugar donde se ve este componente) "Check availability"
// abría un panel vacío en todos los tours. Los tours privados no tienen calendario en WP;
// ahí sólo queda "Book Now".
export default function CheckAvailabilityButton({ link, data_tour, calendarLink }: { link?: string; data_tour?: string; calendarLink?: string | null }) {


    const svg = useRef<SVGSVGElement | null>(null);
    const [rotation, setRotation] = useState(0);
    const [open, setOpen] = useState(false);


    function handleClick() {
        const newRotation = rotation + 180;
        setRotation(newRotation);
        if (svg.current) {
            svg.current.style.transform = `rotate(${newRotation}deg)`;
        }
        setOpen(!open);
    }

    return (
        <div className="check-availaibity-component">
            <div className="availability-container">
                {calendarLink && (
                    <button className="availability-btn" onClick={handleClick}>
                        Check availability
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" ref={svg} style={{ transition: "transform 0.4s ease-in-out" }} >
                            <path d="M5.03125 13.1865L10.0313 8.18652L15.0313 13.1865" stroke="#01787A" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
                <BookNowButton
                    link={link}
                    data_tour={data_tour}
                />
            </div>
            {calendarLink && (
                <div className={`calendar-availability ${open ? "active" : "inactive"}`} >
                    {/* Se monta recién al abrirlo: el iframe de FareHarbor pesa y la mayoría
                        de las visitas no lo abre. */}
                    {open && <Calendar link={calendarLink} />}
                </div>
            )}
        </div>
    )
}