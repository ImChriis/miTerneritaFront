import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { VENUE } from '../data/site';

const SITE = 'Mi Ternerita House';
export const DEFAULT_DESCRIPTION =
  'Entradas para conciertos, fiestas y eventos en Mi Ternerita House, Maracaibo. Compra desde tu móvil, paga con Pago Móvil o Zelle y recibe tu QR por correo.';
const DEFAULT_IMAGE = 'assets/img/optimized/fondo1.webp';

export interface SeoData {
  /** Sin el sufijo de la marca. */
  title?: string;
  description?: string;
  /** Absoluta o relativa al sitio. */
  image?: string;
  /** Páginas privadas o sin valor en buscadores (login, compra, perfil, panel). */
  noindex?: boolean;
  type?: 'website' | 'article';
  /** Datos estructurados schema.org de la página (además del del local). */
  jsonLd?: object | null;
}

export const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Av. Fuerzas Armadas',
  addressLocality: 'Maracaibo',
  addressRegion: 'Zulia',
  postalCode: '4005',
  addressCountry: 'VE'
};

/** El local, para Google: aparece en todas las páginas públicas. */
const localJsonLd = (origin: string) => ({
  '@context': 'https://schema.org',
  '@type': 'NightClub',
  name: SITE,
  url: origin + '/',
  logo: `${origin}/assets/img/logo.png`,
  image: `${origin}/${DEFAULT_IMAGE}`,
  address: ADDRESS,
  geo: { '@type': 'GeoCoordinates', latitude: 10.6945, longitude: -71.6283 },
  hasMap: VENUE.mapsUrl
});

/**
 * Metadatos de cada página para buscadores y para las vistas previas al
 * compartir. Las URL se arman con el dominio en el que corre la web, así que
 * sirven igual en local, en Vercel o con dominio propio.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);

  update(data: SeoData) {
    const origin = this.document.location.origin;
    const url = origin + this.document.location.pathname;
    const title = data.title ? `${data.title} · ${SITE}` : `${SITE} | Entradas y eventos en Maracaibo`;
    const description = (data.description || DEFAULT_DESCRIPTION).slice(0, 160);
    const image = this.absolute(data.image || DEFAULT_IMAGE, origin);

    this.title.setTitle(title);
    this.tag('name', 'description', description);
    this.tag('name', 'robots', data.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    this.tag('property', 'og:title', title);
    this.tag('property', 'og:description', description);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:type', data.type ?? 'website');
    this.tag('name', 'twitter:title', title);
    this.tag('name', 'twitter:description', description);
    this.tag('name', 'twitter:image', image);
    this.canonical(data.noindex ? null : url);
    this.jsonLd(data.noindex ? [] : [localJsonLd(origin), ...(data.jsonLd ? [data.jsonLd] : [])]);
  }

  absolute(path: string, origin = this.document.location.origin) {
    return /^https?:\/\//i.test(path) ? path : `${origin}/${path.replace(/^\/+/, '')}`;
  }

  private tag(attr: 'name' | 'property', key: string, content: string) {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }

  private canonical(url: string | null) {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private jsonLd(items: object[]) {
    this.document.head.querySelectorAll('script[data-seo]').forEach(s => s.remove());
    for (const item of items) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset['seo'] = '';
      script.textContent = JSON.stringify(item);
      this.document.head.appendChild(script);
    }
  }
}
