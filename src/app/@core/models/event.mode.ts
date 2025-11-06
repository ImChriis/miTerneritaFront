export interface Event {
    idEvents: number;
    name: string;
    description: string;
    date: Date;
    time: string;
    room: string;
    capacity: number;
    flyer: File;
    image1: File;
    image2: File;
    image3: File;
    status: number;
}