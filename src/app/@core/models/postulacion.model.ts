/** Mismas listas que el backend (src/postulaciones/entities/postulacion.entity.ts). */
export const ESTADOS_POSTULACION = ['Nueva', 'Revisada', 'Contactado', 'Descartada'];

export interface Postulacion {
  idPostulacion: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  puesto: string;
  mensaje: string | null;
  /** Nombre del PDF si adjuntó CV. */
  cv: string | null;
  estado: string;
  fecha: string;
}

export type NuevaPostulacion = Omit<Postulacion, 'idPostulacion' | 'estado' | 'fecha' | 'cv'>;

/** GET /postulaciones/puestos: todos los puestos y los que el admin tiene abiertos. */
export interface PuestosPostulacion {
  puestos: string[];
  abiertos: string[];
}

/** El backend rechaza CVs de más de 500 KB. */
export const MAX_CV_BYTES = 500 * 1024;
