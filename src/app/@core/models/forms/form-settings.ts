import { FormControl } from "@angular/forms";

export interface FormSettings {
    email: FormControl<string>;
    phone: FormControl<string>;
    instagram: FormControl<string>;
    BCV: FormControl<number | null>;
    tasaDolar: FormControl<number | null>;
}