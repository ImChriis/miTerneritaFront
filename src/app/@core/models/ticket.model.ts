export interface Ticket {
    idTicket: number;
    name: string;
    // La API lo envía como texto ("5.00"); conviértelo con Number() antes de operar.
    price: number | string;
    idEvents: number;
    status: number;
}
