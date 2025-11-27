// ...existing code...
import { FormControl } from "@angular/forms";

export interface FormPayment {
  // noDocumento?: FormControl<string | null>;
  idUser: FormControl<number | null>;
  idEvents: FormControl<number | null>;
  // idConsumeDetails?: FormControl<number | null>;
  // totalBaseImponible?: FormControl<number | null>;
  // impuestoBaseImponible?: FormControl<number | null>;
  // totalExento?: FormControl<number | null>;
  // descuento?: FormControl<number | null>;
  // subtotalGeneral?: FormControl<number | null>;
  // porcentajeIgtf?: FormControl<number | null>;
  // totalIgtf?: FormControl<number | null>;
  // impuesto?: FormControl<number | null>;
  // porcentajeIva?: FormControl<number | null>;
  totalGeneral: FormControl<number | null>;
  tasaDolar: FormControl<number | null>;
  montoDolar: FormControl<number | null>;
  comprobante: FormControl<File | null>;
  banco: FormControl<string | null>;
  referencia: FormControl<string | null>;
  fechaTransferencia: FormControl<string | null>; // 'YYYY-MM-DD'
  status: FormControl<number | null>;

  //extras
  idTicket: FormControl<number | null>;
  ticketNum: FormControl<number | null>;
}
