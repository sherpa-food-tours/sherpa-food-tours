"use client";

import { useEffect, useState } from "react";
import { withAffiliateRef } from "@/lib/affiliate";

export default function Calendar({link}: {link?: string}) {
  // const defaultLink = "https://fareharbor.com/embeds/calendar/sherpafoodtours_argentina/items/627977/?flow=1385081&full-items=yes&fallback=simple";
  // El código de afiliado vive en una cookie, que el server no ve: se agrega después de
  // montar para no romper la hidratación. Sólo recarga el iframe si hay un afiliado.
  const [srcLink, setSrcLink] = useState(link);
  useEffect(() => {
    setSrcLink(withAffiliateRef(link));
  }, [link]);

  return (
    <div className="fareharbor-calendar-wrap" style={{ minHeight: "600px" }}>
      <iframe
        key={srcLink}
        src={srcLink}
        frameBorder="0"
        width="100%"
        height="600"
        title="FareHarbor Calendar"
        style={{ border: "0" }}
        allow="payment"
      />
    </div>
  );
}
