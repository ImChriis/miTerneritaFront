import { FormControl } from "@angular/forms";

export interface FormDrink{
    description: FormControl<string>;
    price: FormControl<number | null>;
    status: FormControl<number | null>;
    image: FormControl<File | null>;
}