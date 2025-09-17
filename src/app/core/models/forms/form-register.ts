import { FormControl } from "@angular/forms";

export interface RegisterForm{
  name: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  idRol: FormControl<number>;
  status: FormControl<string>;
}