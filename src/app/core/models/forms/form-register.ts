import { FormControl } from "@angular/forms";

export interface RegisterForm{
  nombre: FormControl<string>;
  apellido: FormControl<string>;
  tipoIdentificacion: FormControl<string>;
  numeroIdentificacion: FormControl<string>;
  identificacion: FormControl<string>;
  direccion: FormControl<string>;
  telefono: FormControl<string>;
  correo: FormControl<string>;
  clave: FormControl<string>;
  confirmarClave: FormControl<string>;
  accion: FormControl<string>;
  rol: FormControl<number>;
  estado: FormControl<string>;
}