export interface Payment{
  idPayments: number;
  // noDocumento?: string | null;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM:SS'
  idUser?: number | null;
  idEvents?: number | null;
    // idConsumeDetails?: number | null;
    // totalBaseImponible?: number | null;
    // impuestoBaseImponible?: number | null;
    // totalExento?: number | null;
    // descuento?: number | null;
    // subtotalGeneral?: number | null;
    // porcentajeIgtf?: number | null;
    // totalIgtf?: number | null;
    // impuesto?: number | null;
    // porcentajeIva?: number | null;
  totalGeneral?: number | null;
  tasaDolar?: number | null;
  montoDolar?: number | null;
  comprobante?: File | null;
  banco?: string | null;
  referencia?: string | null;
  fechaTransferencia?: string | null; // 'YYYY-MM-DD' o null
  status: number;
}