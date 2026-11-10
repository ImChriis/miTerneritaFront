import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.developer';
import { NuevaPostulacion, Postulacion, PuestosPostulacion } from '../models/postulacion.model';

/** Postulaciones de trabajo: el formulario es público; el resto, solo admin. */
@Injectable({ providedIn: 'root' })
export class PostulacionesService {
  private http = inject(HttpClient);
  private api = `${environment.api}/postulaciones`;

  /** multipart: los datos y el PDF opcional en `cv`. */
  enviar(datos: NuevaPostulacion, cv: File | null) {
    const fd = new FormData();
    Object.entries(datos).forEach(([k, v]) => v && fd.append(k, v));
    if (cv) fd.append('cv', cv);
    return this.http.post<{ message: string }>(this.api, fd);
  }

  puestos() {
    return this.http.get<PuestosPostulacion>(`${this.api}/puestos`);
  }

  guardarPuestos(abiertos: string[]) {
    return this.http.put<PuestosPostulacion>(`${this.api}/puestos`, { abiertos });
  }

  /** El CV es privado: se descarga con el token y se abre como blob. */
  cv(id: number) {
    return this.http.get(`${this.api}/${id}/cv`, { responseType: 'blob' });
  }

  listar() {
    return this.http.get<Postulacion[]>(this.api);
  }

  cambiarEstado(id: number, estado: string) {
    return this.http.patch<Postulacion>(`${this.api}/${id}/estado`, { estado });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
