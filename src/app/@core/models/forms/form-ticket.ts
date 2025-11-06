import { FormControl } from "@angular/forms";

export interface FormTicket {
    name: FormControl<string>;
    price: FormControl<number | null>;
    idEvents: FormControl<number | null>;
    status: FormControl<number | null>;
}