/**
 * Botellas con acceso General: apagado por ahora (igual que ACCESO_POR_BOTELLA
 * del backend, src/consumeDetails/menu.ts). En false el menú trae personas = 0
 * y hay que comprar al menos una entrada.
 */
export const ACCESO_POR_BOTELLA = false;

/** GET /events/:id/menu del backend. */
export interface ProductoMenu {
  /** Solo viene uno de los dos: se copia tal cual en `consumos` al pagar. */
  idFood?: number;
  idDrinks?: number;
  nombre: string;
  descripcion: string | null;
  precioUsd: number;
  /** Archivo en /assets/img; null si no tiene foto. */
  imagen: string | null;
  /** Botellas: personas a las que da acceso General. 0 = no incluye acceso. */
  personas: number;
}

export interface SeccionMenu {
  nombre: string;
  productos: ProductoMenu[];
}

export interface MenuEvento {
  idEvents: number;
  consumo: boolean;
  secciones: SeccionMenu[];
}

/** Lo que viaja de consumo a checkout y pago (history.state.consumo). */
export interface LineaConsumo {
  idFood?: number;
  idDrinks?: number;
  name: string;
  cantidad: number;
  total: number;
  personas: number;
}
