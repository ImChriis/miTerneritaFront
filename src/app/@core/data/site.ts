// Datos fijos del sitio. Edítalos aquí y se actualizan en toda la web.

export const VENUE = {
  name: 'Mi Ternerita House',
  address: 'Av. Fuerzas Armadas, Maracaibo 4005, Zulia',
  mapsUrl: 'https://maps.google.com/?q=Mi+Ternerita+Norte+Bar+%26+Grill+Maracaibo',
  mapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.517450966169!2d-71.62825392435597!3d10.694513760698154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e899ed37da9f0d1%3A0xdfaad299e9c315e1!2sMi%20Ternerita%20Norte%20Bar%20%26%20Grill!5e0!3m2!1ses!2sve!4v1788971474392!5m2!1ses!2sve'
};

export interface Partner {
  name: string;
  /** Ruta del logo, p. ej. 'assets/img/partners/polar.png'. Si está vacío se muestra el nombre. */
  logo?: string;
  url?: string;
  /** Logo con partes negras que desaparecen en modo oscuro: ahí se pinta blanco. */
  invertDark?: boolean;
}

/**
 * Empresas aliadas / patrocinadores del carrusel de la página de inicio.
 * Logos en src/assets/img/partners/ (PNG/SVG recortado, fondo transparente).
 * Sin `logo` se muestra el nombre como texto.
 */
export const PARTNERS: Partner[] = [
  { name: 'Loop', logo: 'assets/img/partners/loop.svg' },
  { name: 'Santa Teresa' },
  { name: 'Smirnoff', logo: 'assets/img/partners/smirnoff.png' },
  { name: 'Old Parr', logo: 'assets/img/partners/old-parr.png', invertDark: true },
  { name: "Buchanan's", logo: 'assets/img/partners/buchanans.png' }
];

/** Espacios del local (sección "Conoce nuestros espacios"). */
export const SPACES = [
  { name: 'Bar', image: 'assets/img/optimized/zona3.webp' },
  { name: 'Lobby', image: 'assets/img/optimized/zona1.webp' },
  { name: 'Barra', image: 'assets/img/optimized/zona2.webp' },
  { name: 'Sala', image: 'assets/img/optimized/sillas1.webp' },
  { name: 'Terraza', image: 'assets/img/optimized/sillas2.webp' }
] as const;
