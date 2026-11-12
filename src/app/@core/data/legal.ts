// Textos legales del sitio. Edítalos aquí; la página /legal/:doc los muestra.

export const EMPRESA = {
  razonSocial: 'REMITE, C.A.',
  rif: 'J315747960',
  domicilio: 'Calle 51 entre Av. 15A y 15D, Edif. Mi Ternerita, piso 15A-17, local PB, zona La California, Maracaibo, Zulia, zona postal 4002',
  correo: 'miterneritacontabilidad@gmail.com',
  whatsapp: '04146363939'
};

export const VIGENCIA = 'Vigente desde el lunes 26 de octubre de 2026.';

export interface SeccionLegal {
  titulo: string;
  parrafos?: string[];
  lista?: string[];
}

export interface DocumentoLegal {
  titulo: string;
  intro: string;
  secciones: SeccionLegal[];
}

const contacto = `el correo ${EMPRESA.correo} o el WhatsApp ${EMPRESA.whatsapp}`;

export const DOCUMENTOS: Record<'terminos' | 'privacidad' | 'aviso-legal', DocumentoLegal> = {
  terminos: {
    titulo: 'Términos y condiciones',
    intro:
      'Estos términos regulan la compra de entradas y de consumo anticipado en este sitio. Al marcar la casilla de aceptación y confirmar tu pago, los aceptas de forma electrónica, con la misma validez que una firma, conforme a la Ley sobre Mensajes de Datos y Firmas Electrónicas.',
    secciones: [
      { titulo: '1. Quién vende', parrafos: [`${EMPRESA.razonSocial}, RIF ${EMPRESA.rif}, con domicilio en ${EMPRESA.domicilio}. Contacto: ${contacto}.`] },
      {
        titulo: '2. Qué compras',
        parrafos: [
          'Entradas para un evento del local y, si el evento lo permite, consumo (comidas y bebidas) por adelantado para esa fecha. La compra no reserva mesas ni lugares, salvo que la entrada lo indique (por ejemplo, una zona VIP o un palco).'
        ]
      },
      {
        titulo: '3. Solo mayores de 18 años',
        parrafos: [
          'Vendemos bebidas alcohólicas y la venta es solo para mayores de 18 años. En la entrada te pediremos tu cédula. Podemos negar la entrada o la entrega si la persona es menor de edad, conforme a la Ley Orgánica para la Protección de Niños, Niñas y Adolescentes.'
        ]
      },
      {
        titulo: '4. Precios',
        parrafos: [
          'Los precios se expresan en dólares (USD), con su equivalente en bolívares calculado a la tasa oficial del Banco Central de Venezuela (BCV) vigente el día del pago, que se muestra en el sitio. Los precios publicados son finales; si alguna forma de pago genera un cargo o impuesto adicional, te lo informaremos antes de pagar.'
        ]
      },
      {
        titulo: '5. Apartado de entradas',
        parrafos: [
          'Al continuar con tu compra apartamos tus entradas durante el tiempo que muestra el contador. Si el tiempo termina sin que registres tu pago, las entradas vuelven a estar disponibles para otras personas.'
        ]
      },
      {
        titulo: '6. Pago y confirmación',
        parrafos: [
          'Puedes pagar por Pago Móvil, transferencia bancaria o Zelle, con los datos que se muestran al pagar. Tu compra queda confirmada solo cuando validamos tu pago. Si el pago no coincide o no lo recibimos, la compra no se procesa y te avisaremos por correo. Cuando lo validemos, recibirás tu código QR por correo.'
        ]
      },
      { titulo: '7. Factura', parrafos: ['El correo con el código QR no es una factura fiscal. Puedes solicitarla en la entrada al momento de tu llegada.'] },
      {
        titulo: '8. Tu código QR',
        parrafos: [
          'El código QR es personal y sirve solo para el evento comprado. Vale por el número de entradas de tu compra: pueden entrar todas juntas o en momentos distintos, y no admite más ingresos que las entradas pagadas. Preséntalo en la entrada junto con tu cédula. No compartas tu QR: quien lo presente primero podrá usarlo.'
        ]
      },
      {
        titulo: '9. Cambios, cancelaciones y reembolsos',
        lista: [
          'Si el local cancela o reprograma el evento, podrás elegir entre usar tu compra en la nueva fecha o recibir el reembolso de lo pagado, por el mismo medio y en la misma moneda, dentro de los 15 días hábiles siguientes.',
          'Si no puedes asistir, puedes pedir el cambio a otra fecha disponible escribiéndonos con al menos 24 horas de anticipación.',
          'Si no asistes ni pides el cambio a tiempo, la compra no es reembolsable.',
          'El consumo no retirado el día del evento no se acumula para otra fecha.'
        ]
      },
      {
        titulo: '10. Admisión',
        parrafos: [
          'El local se reserva el derecho de admisión conforme a la ley y sin discriminación. Podemos negar la entrada o la entrega por razones de seguridad, por conducta violenta o por estado de embriaguez evidente. En esos casos aplicamos lo previsto en el punto 9.'
        ]
      },
      { titulo: '11. Consumo responsable', parrafos: ['Promovemos el consumo responsable de alcohol. Si vas a beber, no conduzcas.'] },
      {
        titulo: '12. Causas ajenas',
        parrafos: [
          'No respondemos por incumplimientos causados por fuerza mayor o hechos ajenos al local, como fallas generales de electricidad o de internet, o decisiones de las autoridades. En esos casos te ofreceremos una nueva fecha o el reembolso, según el punto 9.'
        ]
      },
      { titulo: '13. Tus datos', parrafos: ['Usamos tus datos según nuestra Política de privacidad.'] },
      {
        titulo: '14. Reclamos',
        parrafos: [
          `Escríbenos por ${contacto} con tu número de documento de compra. Te responderemos en un máximo de 15 días hábiles. También puedes acudir a la autoridad de protección al consumidor.`
        ]
      },
      {
        titulo: '15. Ley aplicable',
        parrafos: ['Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Para cualquier controversia son competentes los tribunales de Maracaibo.']
      }
    ]
  },

  privacidad: {
    titulo: 'Política de privacidad',
    intro:
      'En Mi Ternerita cuidamos tus datos. Aquí te explicamos qué datos usamos cuando creas tu cuenta y compras en este sitio, para qué, con quién se comparten, cuánto tiempo se guardan y cómo puedes ejercer tus derechos.',
    secciones: [
      { titulo: '1. Quién es responsable de tus datos', parrafos: [`${EMPRESA.razonSocial}, RIF ${EMPRESA.rif}, con domicilio en ${EMPRESA.domicilio}. Puedes escribirnos por ${contacto}.`] },
      {
        titulo: '2. Normas que aplicamos',
        parrafos: [
          'Tratamos tus datos conforme a la Constitución de la República Bolivariana de Venezuela (artículos 28 y 60, derecho a la protección de datos y habeas data), a los principios fijados por la Sala Constitucional del Tribunal Supremo de Justicia (sentencia del 4 de agosto de 2011), a la Ley sobre Mensajes de Datos y Firmas Electrónicas y a la Ley Especial contra los Delitos Informáticos.'
        ]
      },
      {
        titulo: '3. Qué datos usamos',
        lista: [
          'Cuenta e identificación: nombre, apellido, cédula, correo, teléfono y contraseña (guardada cifrada, nunca en texto legible).',
          'Compra: evento, entradas, consumo, montos y tasa aplicada.',
          'Pago: método, banco, referencia, fecha y la imagen del comprobante que adjuntas (puede contener datos bancarios).',
          'Entrada: fecha y hora de cada escaneo de tu código QR y el personal que lo registró.',
          'Postulaciones de empleo: los datos y el CV que nos envías en "Trabaja con nosotros".',
          'Solicitudes que nos envíes sobre tus datos.'
        ]
      },
      {
        titulo: '4. Para qué los usamos',
        lista: [
          'Procesar tu compra y confirmar tu pago.',
          'Enviarte tu código QR y avisarte por correo si tu pago se aprueba o se rechaza.',
          'Verificar tu identidad y tu edad en la entrada, y controlar los ingresos.',
          'Cumplir nuestras obligaciones contables y fiscales.',
          'Evaluar tu postulación, si nos envías una.'
        ],
        parrafos: ['No usamos tus datos para otros fines ni tomamos decisiones automáticas que te afecten.']
      },
      {
        titulo: '5. Por qué podemos usarlos',
        parrafos: [
          'Usamos tus datos porque nos das tu consentimiento al registrarte y al aceptar estas condiciones, porque son necesarios para la compra que solicitas y porque algunas leyes nos obligan a conservar registros de las ventas.'
        ]
      },
      {
        titulo: '6. Con quién se comparten',
        lista: [
          'Proveedores tecnológicos que trabajan por cuenta nuestra: Render (servidor), TiDB Cloud (base de datos, donde también se guardan los comprobantes) y Vercel (alojamiento del sitio). Sus servidores están fuera de Venezuela, por lo que tus datos se transfieren al exterior con medidas de seguridad.',
          'Gmail (Google), para enviarte los correos de tu compra.',
          'WhatsApp (Meta), solo cuando tú nos escribes por ese medio.',
          'Autoridades, solo cuando la ley lo exija.'
        ],
        parrafos: [
          'Para calcular la tasa consultamos fuentes públicas sin enviar datos personales. No vendemos ni alquilamos tus datos.'
        ]
      },
      {
        titulo: '7. Cuánto tiempo los guardamos',
        lista: [
          'Imágenes de comprobantes: 12 meses desde la compra.',
          'Datos de la compra: 6 años, por obligaciones fiscales.',
          'Postulaciones: hasta que las borremos o nos pidas eliminarlas.',
          'Solicitudes sobre tus datos: 2 años después de respondidas.'
        ]
      },
      {
        titulo: '8. Tus derechos',
        parrafos: [
          `Puedes pedir en cualquier momento acceder a tus datos, corregirlos o actualizarlos, suprimirlos, oponerte a algún uso o retirar tu consentimiento, escribiéndonos por ${contacto}. Te responderemos en un máximo de 15 días hábiles. Algunos datos de ventas deben conservarse por ley; en ese caso te lo explicaremos y los guardaremos sin usarlos para otros fines. Si no recibes respuesta, puedes acudir a los tribunales mediante la acción de habeas data.`
        ]
      },
      {
        titulo: '9. Cómo protegemos tus datos',
        lista: [
          'Conexión cifrada (HTTPS) en todo el sitio.',
          'Solo el personal autorizado entra al panel, con usuario y contraseña, y cada uno ve solo lo que su rol permite.',
          'Los comprobantes y los CV se guardan de forma privada: solo los ve el comprador o el personal autorizado.',
          'Cada escaneo de entradas queda registrado con el personal que lo hizo.'
        ],
        parrafos: [
          'Ningún sistema es infalible. Si ocurriera un incidente que afecte tus datos, te lo informaremos y tomaremos las medidas necesarias.'
        ]
      },
      {
        titulo: '10. Menores de edad',
        parrafos: ['El sitio es solo para mayores de 18 años. No vendemos a menores ni usamos sus datos a sabiendas. Si detectamos datos de un menor, los eliminamos.']
      },
      {
        titulo: '11. Datos guardados en tu navegador',
        parrafos: [
          'Guardamos en tu navegador tu sesión, tu preferencia de tema (claro u oscuro) y, mientras compras, el avance de tu compra, para que no lo pierdas si sales de la página. Puedes borrarlos cerrando sesión o borrando los datos del sitio en tu navegador.'
        ]
      },
      {
        titulo: '12. Cambios a esta política',
        parrafos: ['Si la cambiamos, actualizaremos la fecha de vigencia. Si el cambio es importante, te pediremos aceptarla de nuevo en tu próxima compra.']
      }
    ]
  },

  'aviso-legal': {
    titulo: 'Aviso legal',
    intro: 'Este aviso identifica al titular del sitio y explica las condiciones generales de su uso.',
    secciones: [
      {
        titulo: '1. Titular del sitio',
        parrafos: [`Este sitio pertenece a ${EMPRESA.razonSocial}, RIF ${EMPRESA.rif}, que opera con el nombre comercial Mi Ternerita House, con domicilio en ${EMPRESA.domicilio}. Contacto: ${contacto}.`]
      },
      {
        titulo: '2. Uso del sitio',
        parrafos: [
          'Al usar este sitio te comprometes a hacerlo de forma lícita y a no dañar su funcionamiento, intentar acceder a cuentas o zonas que no te corresponden, ni copiar o revender entradas o códigos QR.'
        ]
      },
      {
        titulo: '3. Propiedad intelectual',
        parrafos: [
          'Los textos, imágenes, logotipos, flyers y el diseño del sitio pertenecen a su titular o a sus autores y se usan con permiso. No puedes reproducirlos ni usarlos con fines comerciales sin autorización. Las marcas de terceros (bancos, aliados y patrocinadores) pertenecen a sus dueños.'
        ]
      },
      {
        titulo: '4. Información publicada',
        parrafos: [
          'Procuramos que la información de eventos, precios y horarios sea correcta y esté al día, pero puede cambiar. Si un evento se modifica o se cancela, aplicamos lo previsto en los Términos y condiciones.'
        ]
      },
      {
        titulo: '5. Enlaces a otros sitios',
        parrafos: ['El sitio puede enlazar a servicios de terceros (mapas, redes sociales, WhatsApp). No somos responsables de su contenido ni de sus políticas.']
      },
      {
        titulo: '6. Compras y datos personales',
        parrafos: ['Las compras se rigen por los Términos y condiciones, y el uso de tus datos por la Política de privacidad.']
      },
      {
        titulo: '7. Ley aplicable',
        parrafos: ['Este aviso se rige por las leyes de la República Bolivariana de Venezuela. Para cualquier controversia son competentes los tribunales de Maracaibo.']
      }
    ]
  }
};
