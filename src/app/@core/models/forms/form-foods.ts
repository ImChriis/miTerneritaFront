import { FormControl } from "@angular/forms";

export interface FormFood{
    description: FormControl<string>;
    price: FormControl<number | null>;
    status: FormControl<number | null>;
    image: FormControl<File | null>;
}