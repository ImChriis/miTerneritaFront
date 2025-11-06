import { FormControl } from "@angular/forms";

export interface FormEvent {
    name: FormControl<string>;
    description: FormControl<string>;
    date: FormControl<string>;
    time: FormControl<string>;
    room: FormControl<string>;
    capacity: FormControl<number | null>;
    flyer: FormControl<File | null>;
    image1: FormControl<File | null>;
    image2: FormControl<File | null>;
    image3: FormControl<File | null>;
    status: FormControl<number | null>;
}