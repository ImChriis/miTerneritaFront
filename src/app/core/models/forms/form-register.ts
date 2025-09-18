import { FormControl } from "@angular/forms";

export interface RegisterForm{
  name: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  idRol: FormControl<number>;
  status: FormControl<string>;
  tipo: FormControl<string>;
  cedula: FormControl<string>;
  confirmPassword: FormControl<string>;
  noCedula: FormControl<string>;
}