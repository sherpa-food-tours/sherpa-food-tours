import { wp } from "@/lib/wp";

// Sin try/catch a propósito: getPostImage ya devuelve el fallback cuando la imagen no
// existe, y si WordPress está caído el error tiene que llegar a la página para que ISR
// conserve la versión anterior. Devolver [] acá rompía después en mainImage[0].img.
export async function fetchImages(ids: number[]) {
    const data = await Promise.all(ids.map(id => wp.getPostImage(id)));
    return data.filter(Boolean); // filtra null/undefined
}