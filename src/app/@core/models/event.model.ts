export interface Event{
    capacity: number;
    // La API envía 'YYYY-MM-DD'; usa parseEventDate() de @core/utils/event-utils para mostrarla.
    date: Date | string;
    time: string;
    description: string;
    idEvents: number;
    flyer: string;
    image1: string;
    image2: string;
    image3: string;
    name: string;
    room: string;
    status: number;
    consumo: number;
    // Opcional: 'concierto' | 'fiesta' | ... Si el backend no lo envía se deduce del nombre.
    category?: string | null;
}
