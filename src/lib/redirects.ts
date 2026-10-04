// Redirects permanentes del sitio. Viven acá y no en next.config.ts porque los usan dos
// lados: next.config los registra como redirects de Next, y wp-links los usa para que los
// links internos de los artículos apunten directo al destino final en vez de pasar por
// un 308 (las cadenas que marcó la auditoría de Propellic).
//
// Patrones soportados por resolveRedirect: rutas exactas, `:param` y `:param*`. Si se
// agrega una regla con `has`, regex o un patrón más complejo, extender el matcher.

export type SiteRedirect = {
    source: string;
    destination: string;
    permanent: boolean;
};

export const REDIRECTS: SiteRedirect[] = [
  {
    source: '/author/sof%C3%ADagonzalez',
    destination: '/author/sofia-gonzalez/',
    permanent: true,
  },
  {
    source: '/author/sof%C3%ADagonzalez/',
    destination: '/author/sofia-gonzalez/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/buenos-aires-best-cocktail-bars-a-neighbourhood-guide',
    destination: '/travel-guide/buenos-aires/best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/buenos-aires-best-cocktail-bars-a-neighbourhood-guide/',
    destination: '/travel-guide/buenos-aires/best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/raise-a-glass-discover-the-10-best-bars-in-buenos-aires',
    destination: '/travel-guide/buenos-aires/best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/raise-a-glass-discover-the-10-best-bars-in-buenos-aires/',
    destination: '/travel-guide/buenos-aires/best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/city/buenos-aires-2',
    destination: '/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/city/buenos-aires-2/',
    destination: '/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/tour/paris-private-tour',
    destination: 'https://www.sherpafoodtours.com/tour/paris-private-experience/',
    permanent: true,
  },
  {
    source: '/tour/paris-private-tour/',
    destination: 'https://www.sherpafoodtours.com/tour/paris-private-experience/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-buenos-aires/:path*',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-buenos-aires',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-amsterdam/:path*',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-amsterdam',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-london/:path*',
    destination: 'https://www.sherpafoodtours.com/city/london/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-london',
    destination: 'https://www.sherpafoodtours.com/city/london/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-mexico-city/:path*',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/travels-guide/city-mexico-city',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/travels-guide/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/',
    permanent: true,
  },
  {
    source: '/travels-guide/:path*',
    destination: 'https://www.sherpafoodtours.com/travel-guide/',
    permanent: true,
  },
  {
    source: '/argentinian-cookies-alfajores/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/argentinian-cookies-alfajores/',
    permanent: true,
  },
  {
    source: '/48-hours-in-buenos-aires-the-best-things-to-do-in-this-vibrant-city',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/48-hours-in-buenos-aires-the-best-things-to-do-in-this-vibrant-city',
    permanent: true,
  },
  {
    source: '/best-bakeries-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/best-bakeries-in-mexico-city/',
    permanent: true,
  },
  {
    source: '/best-indonesian-restaurants-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-indonesian-restaurants-amsterdam/',
    permanent: true,
  },
  {
    source: '/the-best-bars-in-amsterdam-top-15-drinking-spots/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/the-best-bars-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/shop-til-you-drop-uncover-buenos-aires-best-shopping-areas/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/shop-til-you-drop-uncover-buenos-aires-best-shopping-areas/',
    permanent: true,
  },
  {
    source: '/best-casual-restaurants-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-casual-restaurants-amsterdam/',
    permanent: true,
  },
  {
    source: '/vegan-food-tour-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/vegan-food-tour-paris/',
    permanent: true,
  },
  {
    source: '/best-cheese-shop-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-cheese-shop-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/best-stroopwafel-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-stroopwafel-amsterdam/',
    permanent: true,
  },
  {
    source: '/best-steakhouses-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-steakhouses-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/amsterdam-street-food/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/amsterdam-street-food/',
    permanent: true,
  },
  {
    source: '/best-bitterballen-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-bitterballen-amsterdam/',
    permanent: true,
  },
  {
    source: '/traditional-argentine-drinks-and-where-to-try-them/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/traditional-argentine-drinks-and-where-to-try-them/',
    permanent: true,
  },
  {
    source: '/traditional-argentine-drinks/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/traditional-argentine-drinks-and-where-to-try-them/',
    permanent: true,
  },
  {
    source: '/tour/londres-food-tour/',
    destination: 'https://www.sherpafoodtours.com/tour/london-food-tour/',
    permanent: true,
  },
  {
    source: '/sobre-nosotros/',
    destination: 'https://www.sherpafoodtours.com/about-us/',
    permanent: true,
  },
  {
    source: '/about-us-2/',
    destination: 'https://www.sherpafoodtours.com/about-us/',
    permanent: true,
  },
  {
    source: '/es/traditional-argentine-drinks-and-where-to-try-them-3/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/traditional-argentine-drinks-and-where-to-try-them/',
    permanent: true,
  },
  {
    source: '/pt/traditional-argentine-drinks-and-where-to-try-them-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/traditional-argentine-drinks-and-where-to-try-them/',
    permanent: true,
  },
  {
    source: '/argentinian-desserts-list/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/argentina/argentinian-desserts-list/',
    permanent: true,
  },
  {
    source: '/best-croquettes-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-croquettes-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/savour-the-traditions-the-best-spots-to-drink-mate-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/savour-the-traditions-the-best-spots-to-drink-mate-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/best-surinam-restaurants-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-surinam-restaurants-amsterdam/',
    permanent: true,
  },
  {
    source: '/ultimate-guide-to-argentinas-food-culture/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/ultimate-guide-to-argentinas-food-culture/',
    permanent: true,
  },
  {
    source: '/ultimate-guide-to-argentinas-food-culture-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/ultimate-guide-to-argentinas-food-culture/',
    permanent: true,
  },
  {
    source: '/ultimate-guide-to-argentinas-food-culture-3/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/ultimate-guide-to-argentinas-food-culture/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/food-in-buenos-aires-culture/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/ultimate-guide-to-argentinas-food-culture/',
    permanent: true,
  },
  {
    source: '/tour/san-telmo-tour-2',
    destination: '/tour/san-telmo-tour/',
    permanent: true,
  },
  {
    source: '/tour/san-telmo-tour-2/',
    destination: '/tour/san-telmo-tour/',
    permanent: true,
  },
  {
    source: '/tour/san-telmo-food-tour/',
    destination: 'https://www.sherpafoodtours.com/tour/san-telmo-tour/',
    permanent: true,
  },
  {
    source: '/tour/san-telmo-food-tour-4/',
    destination: 'https://www.sherpafoodtours.com/tour/san-telmo-tour/',
    permanent: true,
  },
  {
    source: '/sports-passion-in-buenos-aires-the-5-best-sports-bars/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/sports-passion-in-buenos-aires-the-5-best-sports-bars/',
    permanent: true,
  },
  {
    source: '/best-dishoom-in-london/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/london/best-dishoom-in-london/',
    permanent: true,
  },
  {
    source: '/cocktails-in-the-clouds-the-ultimate-rooftop-bars-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/cocktails-in-the-clouds-the-ultimate-rooftop-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/where-italy-meets-argentina-best-italian-restaurants-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/where-italy-meets-argentina-best-italian-restaurants-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/explore-these-3-michelin-star-restaurants-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/explore-these-3-michelin-star-restaurants-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/michelin-star-restaurants-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/michelin-star-restaurants-mexico-city/',
    permanent: true,
  },
  {
    source: '/best-ice-cream-in-argentina/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/argentina/best-ice-cream-in-argentina/',
    permanent: true,
  },
  {
    source: '/7-must-visit-breweries-in-buenos-aires-for-craft-beer-lovers/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/7-must-visit-breweries-in-buenos-aires-for-craft-beer-lovers/',
    permanent: true,
  },
  {
    source: '/tour/palermo-food-tour-2/',
    destination: 'https://www.sherpafoodtours.com/tour/buenos-aires-local-foodie-experience/',
    permanent: true,
  },
  {
    source: '/tour/palermo-food-tour-3/',
    destination: 'https://www.sherpafoodtours.com/tour/buenos-aires-local-foodie-experience/',
    permanent: true,
  },
  {
    source: '/tour/palermo-food-tour-4/',
    destination: 'https://www.sherpafoodtours.com/tour/buenos-aires-local-foodie-experience/',
    permanent: true,
  },
  {
    source: '/best-restaurants-in-roma-norte-cdmx/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/cdmx/best-restaurants-in-roma-norte-cdmx/',
    permanent: true,
  },
  {
    source: '/best-restaurants-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/cdmx/best-restaurants-in-roma-norte-cdmx/',
    permanent: true,
  },
  {
    source: '/poulette-restaurants-in-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/poulette-restaurants-in-paris/',
    permanent: true,
  },
  {
    source: '/what-is-asado-in-argentina/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/what-is-asado-in-argentina/',
    permanent: true,
  },
  {
    source: '/es/what-is-asado-in-argentina-3/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/what-is-asado-in-argentina/',
    permanent: true,
  },
  {
    source: '/pt/what-is-asado-in-argentina-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/what-is-asado-in-argentina/',
    permanent: true,
  },
  {
    source: '/6-best-places-to-enjoy-empanadas-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/6-best-places-to-enjoy-empanadas-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/buenos-aires-food-what-to-eat-and-where/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/pt/buenos-aires-food-what-to-eat-and-where-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/pt/buenos-aires-food-what-to-eat-and-where-3/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/mexican-fruit-juices/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/mexican-fruit-juices/',
    permanent: true,
  },
  {
    source: '/mexico-city-vegan-food-tour/',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/best-wine-bars-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-wine-bars-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/best-brown-cafe-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-brown-cafe-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/travel-guide/argentina/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-food-buenos-aires/',
    permanent: true,
  },
  {
    source: '/best-food-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-food-buenos-aires/',
    permanent: true,
  },
  {
    source: '/explore-buenos-aires-top-museums-and-their-finest-on-site-restaurants/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/green-escapes-top-parks-to-visit-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/argentinian-cookies-explained-the-gluttons-guide-to-alfajores/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/argentinian-cookies-alfajores/',
    permanent: true,
  },
  {
    source: '/best-affordable-restaurants-in-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/best-affordable-restaurants-in-paris/',
    permanent: true,
  },
  {
    source: '/paris-restaurants-with-a-view/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/paris-restaurants-with-a-view/',
    permanent: true,
  },
  {
    source: '/top-bistros-in-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/top-bistros-in-paris/',
    permanent: true,
  },
  {
    source: '/michelin-star-restaurants-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/michelin-star-restaurants-paris/',
    permanent: true,
  },
  {
    source: '/paris-food-experience/',
    destination: 'https://www.sherpafoodtours.com/city/paris/',
    permanent: true,
  },
  {
    source: '/parisian-cafes/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/parisian-cafes/',
    permanent: true,
  },
  {
    source: '/best-macarons-in-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/best-macarons-in-paris/',
    permanent: true,
  },
  {
    source: '/travel-guide/paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/parisian-cafes/',
    permanent: true,
  },
  {
    source: '/bakeries-in-paris/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/paris/bakeries-in-paris/',
    permanent: true,
  },
  {
    source: '/london-restaurants-with-a-view/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/london/london-restaurants-with-a-view/',
    permanent: true,
  },
  {
    source: '/mercado-de-san-telmo-get-to-know-the-buenos-aires-historic-flea-market/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/coffee-shops-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/coffee-shops-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/amsterdam-food/',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/london-food-culture/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/london/london-food-culture/',
    permanent: true,
  },
  {
    source: '/the-best-restaurants-for-modern-british-food-in-london/',
    destination: 'https://www.sherpafoodtours.com/city/london/',
    permanent: true,
  },
  {
    source: '/travel-guide/london/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/london/london-food-culture/',
    permanent: true,
  },
  {
    source: '/top-10-restaurants-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/top-10-restaurants-in-mexico-city/',
    permanent: true,
  },
  {
    source: '/traditional-mexican-drinks/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/traditional-mexican-drinks/',
    permanent: true,
  },
  {
    source: '/spicy-mexican-dishes-for-heat-lovers/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/spicy-mexican-dishes-for-heat-lovers/',
    permanent: true,
  },
  {
    source: '/amsterdams-best-food-markets-for-every-appetite/',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/michelin-restaurants-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/michelin-restaurants-amsterdam/',
    permanent: true,
  },
  {
    source: '/mexico-city-street-food-tour/',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/best-wine-bars-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/best-wine-bars-mexico-city/',
    permanent: true,
  },
  {
    source: '/michelin-star-tacos-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/michelin-star-tacos-in-mexico-city/',
    permanent: true,
  },
  {
    source: '/best-churros-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/best-churros-in-mexico-city/',
    permanent: true,
  },
  {
    source: '/3-day-buenos-aires-itinerary/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/from-bars-to-bodegas-the-ultimate-ba-wine-tour/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/from-bars-to-bodegas-the-ultimate-ba-wine-tour/',
    permanent: true,
  },
  {
    source: '/es/buenos-aires-food-what-to-eat-and-where-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/fernet-culture-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/fernet-culture-buenos-aires/',
    permanent: true,
  },
  {
    source: '/buenos-aires-street-food/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-street-food/',
    permanent: true,
  },
  {
    source: '/raise-a-glass-discover-the-10-best-bars-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/raise-a-glass-discover-the-10-best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/buenos-aires-best-cocktail-bars-a-neighbourhood-guide/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/raise-a-glass-discover-the-10-best-bars-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/things-to-do-in-san-telmo-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/things-to-do-in-san-telmo-buenos-aires/',
    permanent: true,
  },
  {
    source: '/things-to-do-in-san-telmo-buenos-aires-2/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/things-to-do-in-san-telmo-buenos-aires/',
    permanent: true,
  },
  {
    source: '/green-escapes-top-parks-to-visit-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/pt/city/buenos-aires-3/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/es/city/buenos-aires-2/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/es/tour/palermo-food-tour-3/',
    destination: 'https://www.sherpafoodtours.com/tour/buenos-aires-local-foodie-experience/',
    permanent: true,
  },
  {
    source: '/tour',
    destination: 'https://www.sherpafoodtours.com/tour/buenos-aires-local-foodie-experience/',
    permanent: true,
  },
  {
    source: '/best-pizza-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-pizza-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/best-restaurants-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-restaurants-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/explore-the-best-bookshops-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/48-hours-in-buenos-aires-the-best-things-to-do-in-this-vibrant-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/48-hours-in-buenos-aires-the-best-things-to-do-in-this-vibrant-city/',
    permanent: true,
  },
  {
    source: '/best-argentinian-restaurants-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/best-neighborhoods-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-neighborhoods-buenos-aires/',
    permanent: true,
  },
  {
    source: '/the-10-best-things-to-do-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/the-10-best-things-to-do-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/walking-food-tours-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/top-restaurants-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/top-restaurants-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/eating-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/city/amsterdam/',
    permanent: true,
  },
  {
    source: '/best-taquerias-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/best-taquerias-mexico-city/',
    permanent: true,
  },
  {
    source: '/secret-food-tours-mexicy-city/',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/vegan-restaurants-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/city/mexico-city/',
    permanent: true,
  },
  {
    source: '/tamales-in-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/tamales-in-mexico-city/',
    permanent: true,
  },
  {
    source: '/the-best-food-markets-in-london-from-street-eats-to-gourmet-treats/',
    destination: 'https://www.sherpafoodtours.com/city/london/',
    permanent: true,
  },
  {
    source: '/best-steak-in-london/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/london/best-steak-in-london/',
    permanent: true,
  },
  {
    source: '/hidden-gem-restaurants-mexico-city/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/hidden-gem-restaurants-mexico-city/',
    permanent: true,
  },
  {
    source: '/mexican-desserts/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/mexico-city/mexican-desserts/',
    permanent: true,
  },
  {
    source: '/secret-food-tour-london/',
    destination: 'https://www.sherpafoodtours.com/city/london/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/best-food-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/what-to-eat-in-buenos-aires-where',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/travel-guide/buenos-aires/what-to-eat-in-buenos-aires-where/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/buenos-aires-food-what-to-eat-and-where/',
    permanent: true,
  },
  {
    source: '/travel-guide/amsterdam/best-brown-cafes-in-amsterdam/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/amsterdam/best-brown-cafe-in-amsterdam/',
    permanent: true,
  },
  {
    source: '/the-insiders-guide-to-the-best-steakhouses-in-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/travel-guide/buenos-aires/best-steakhouses-in-buenos-aires/',
    permanent: true,
  },
  {
    source: '/5-things-to-know-before-visiting-argentina/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/beyond-the-city-best-day-trips-from-buenos-aires/',
    destination: 'https://www.sherpafoodtours.com/city/buenos-aires/',
    permanent: true,
  },
  {
    source: '/famous-restaurants-in-paris/',
    destination: 'https://www.sherpafoodtours.com/city/paris/',
    permanent: true,
  },
  // WordPress publica los tours y las ciudades en plural (/tours/x/, /cities/x/) y el
  // sitio en singular. Desde que el frontend de staging redirige a www, esas URLs --
  // que son las que Google tiene indexadas de staging -- aterrizaban aca en 404.
  // Con esto la cadena termina en la pagina real y Google consolida las senales.
  {
    source: '/tours/:slug/',
    destination: '/tour/:slug/',
    permanent: true,
  },
  {
    source: '/cities/:slug/',
    destination: '/city/:slug/',
    permanent: true,
  },
  // Renombre de slugs de tours para alinearlos con la keyword principal (Sheet
  // "Create OP Recs"). Los slugs ya estan cambiados en WordPress: ver
  // TOUR-SLUG-REDIRECTS-PENDIENTES.md.
  {
    source: '/tour/amsterdam-local-foodie-adventure/',
    destination: '/tour/amsterdam-walking-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/buenos-aires-local-foodie-experience/',
    destination: '/tour/palermo-buenos-aires-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/buenos-aires-private-tour/',
    destination: '/tour/buenos-aires-private-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/gourmet-taco-tour/',
    destination: '/tour/taco-tour-mexico-city/',
    permanent: true,
  },
  {
    source: '/tour/london-food-tour/',
    destination: '/tour/soho-london-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/mexico-city-private-experience/',
    destination: '/tour/mexico-city-private-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/mexico-local-foodie-adventure/',
    destination: '/tour/roma-norte-mexico-food-tour/',
    permanent: true,
  },
  {
    source: '/tour/paris-private-experience/',
    destination: '/tour/paris-private-food-tour/',
    permanent: true,
  },
];

const SITE_HOSTS = new Set(["www.sherpafoodtours.com", "sherpafoodtours.com"]);

// `:param*` toma el resto de la ruta, `:param` un segmento. La barra final es opcional en
// los dos lados: con trailingSlash: true, Next matchea /x y /x/ con la misma regla.
function compile(source: string): { regex: RegExp; params: string[] } {
    const params: string[] = [];
    const pattern = source
        .replace(/\/$/, "")
        .split("/")
        .map((segment) => {
            const wildcard = segment.match(/^:(\w+)\*$/);
            if (wildcard) { params.push(wildcard[1]); return "(.*)"; }
            const param = segment.match(/^:(\w+)$/);
            if (param) { params.push(param[1]); return "([^/]+)"; }
            return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("/");
    return { regex: new RegExp(`^${pattern}/?$`), params };
}

const COMPILED = REDIRECTS.map((r) => ({ ...r, ...compile(r.source) }));

/** Un salto: el destino de la primera regla que matchea, o null. Siempre un pathname. */
export function resolveRedirect(pathname: string): string | null {
    for (const rule of COMPILED) {
        const match = pathname.match(rule.regex);
        if (!match) continue;
        let destination = rule.destination;
        rule.params.forEach((name, i) => {
            destination = destination.replace(new RegExp(`:${name}\\*?`), match[i + 1] ?? "");
        });
        if (/^https?:\/\//.test(destination)) {
            const url = new URL(destination);
            if (!SITE_HOSTS.has(url.hostname)) return null;
            destination = url.pathname;
        }
        return destination.replace(/\/{2,}/g, "/");
    }
    return null;
}

/** Sigue la cadena hasta el destino final. Corta a los 10 saltos por si hay un ciclo. */
export function resolveRedirectChain(pathname: string): string | null {
    let current = pathname;
    let moved = false;
    for (let hop = 0; hop < 10; hop++) {
        const next = resolveRedirect(current);
        if (next === null || next === current) break;
        current = next;
        moved = true;
    }
    return moved ? current : null;
}
