export interface Drink{
    idDrinks: number;
    description: string;
    price: number;
    status: number;
    image: File;
    detalle?: string | null;
    orden?: number;
    categoria?: string;
    personas?: number;
}