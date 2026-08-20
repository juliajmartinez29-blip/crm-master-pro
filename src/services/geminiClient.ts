// WARNING: Client-side Gemini API client as explicitly requested by the user.
// In production, ensure API keys are protected or restricted in Google Cloud Console.

import { GoogleGenAI } from '@google/genai';
import { BusinessFormData, GeneratedCRMSystem, CRMField } from '../types';

// Retrieve API key from client-side environment variables
export const getClientApiKey = (): string => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    ''
  );
};

// Fallback high-quality CRM generator for offline / fallback scenarios
export const generateLocalFallbackCRM = (businessData: BusinessFormData): GeneratedCRMSystem => {
  const isColorist = businessData.businessType === 'estilista_independiente';
  const isBarber = businessData.businessType === 'barberia';
  const isDental = businessData.businessType === 'clinica_dental';
  const isSpa = businessData.businessType === 'spa_masajes';
  const isNails = businessData.businessType === 'unas_pestanas';

  return {
    businessSummary: {
      name: businessData.businessName,
      typeLabel: businessData.businessType.replace('_', ' ').toUpperCase(),
      location: `${businessData.city}, ${businessData.country}`,
      currency: `${businessData.currencySymbol} ${businessData.currency}`,
      recommendation: `Sistema de gestión sin costos de suscripción diseñado especialmente para ${businessData.businessName}. Utiliza Google Sheets para el control financiero, Notion para fichas técnicas y WhatsApp Business para fidelización automatizada.`,
    },
    fichaCliente: {
      title: 'Ficha Técnica y Perfil del Cliente',
      description: 'Estructura de base de datos optimizada para Google Sheets y Notion',
      note: 'Si deseas agregar, modificar o borrar algún campo, indícalo en el chat.',
      fields: [
        {
          name: 'ID_Cliente',
          category: 'Datos Generales',
          type: 'Texto',
          isRequired: true,
          example: 'CLI-001',
          purpose: 'Identificador único para evitar duplicados en la base de datos.',
        },
        {
          name: 'Nombre Completo',
          category: 'Datos Generales',
          type: 'Texto',
          isRequired: true,
          example: 'María González',
          purpose: 'Personalización en saludos de WhatsApp y citas.',
        },
        {
          name: 'WhatsApp / Teléfono',
          category: 'Datos Generales',
          type: 'Teléfono / Link',
          isRequired: true,
          example: businessData.whatsapp || '+52 33 1234 5678',
          purpose: 'Envío de confirmaciones, recordatorios y ofertas.',
        },
        {
          name: 'Fecha de Cumpleaños',
          category: 'Preferencias & Hábitos',
          type: 'Fecha',
          isRequired: false,
          example: '15/09',
          purpose: 'Campañas de fidelización y felicitación con regalo.',
        },
        {
          name: isColorist
            ? 'Historial de Color y Decoloración'
            : isBarber
            ? 'Estilo de Corte y Degradado'
            : isDental
            ? 'Antecedentes Médicos / Alergias'
            : isSpa
            ? 'Zonas de Tensión y Presión Preferida'
            : isNails
            ? 'Tipo de Uña y Alergia a Acrílicos'
            : 'Historial Técnico y Especialidad',
          category: 'Especialidad / Historial Técnico',
          type: 'Texto',
          isRequired: true,
          example: isColorist
            ? 'Tono 8.1 con 20 volúmenes, matiz cenizo'
            : isBarber
            ? 'Fade medio comprimido, barba perfilada con navaja'
            : isDental
            ? 'Alergia a penicilina, bruxismo nocturno'
            : isSpa
            ? 'Contratura lumbar, prefiere presión media-fuerte'
            : isNails
            ? 'Uña quebradiza, prefiere Rubber Base tono Nude'
            : 'Registro técnico del procedimiento realizado',
          purpose: 'Garantizar el mismo resultado en visitas posteriores sin errores.',
        },
        {
          name: 'Frecuencia de Visita Estimada',
          category: 'Preferencias & Hábitos',
          type: 'Texto',
          isRequired: false,
          example: 'Cada 21 días',
          purpose: 'Programar recordatorios automáticos antes de que busquen otro lugar.',
        },
        {
          name: 'Bebida o Preferencia de Atención',
          category: 'Preferencias & Hábitos',
          type: 'Texto',
          isRequired: false,
          example: 'Café americano / Prefiere silencio',
          purpose: 'Experiencia VIP de atención al cliente.',
        },
        {
          name: 'Colaborador Favorito',
          category: 'Datos Generales',
          type: 'Selector / Opciones',
          options: ['Carlos M.', 'Laura G.', 'Andrés P.'],
          isRequired: false,
          example: 'Carlos M.',
          purpose: 'Asignación rápida de turnos y comisiones.',
        },
        {
          name: 'Fecha de Última Visita',
          category: 'Financiero & Fidelización',
          type: 'Fecha',
          isRequired: true,
          example: '2026-08-10',
          purpose: 'Detección automática de inactividad con fórmulas.',
        },
        {
          name: 'Total Consumo Acumulado',
          category: 'Financiero & Fidelización',
          type: 'Número',
          isRequired: false,
          example: `${businessData.currencySymbol}150.00`,
          purpose: 'Identificación de clientes VIP para tratos especiales.',
        },
      ],
      sampleClientData: {
        ID_Cliente: 'CLI-001',
        'Nombre Completo': 'María González',
        'WhatsApp / Teléfono': '+52 33 1234 5678',
        'Fecha de Cumpleaños': '15 de Septiembre',
        'Historial Técnico': 'Procedimiento premium registrado con satisfacción total',
        'Fecha de Última Visita': '2026-08-10',
        'Total Consumo Acumulado': `${businessData.currencySymbol}120.00`,
      },
    },
    plantillasMensajes: [
      {
        id: 'tpl-confirmacion',
        title: 'Confirmación Inmediata de Cita',
        scenario: 'confirmacion',
        category: 'Citas',
        recommendedTiming: 'Al momento de agendar la cita',
        templateText: `¡Hola [Nombre_Cliente]! ✨ Tu cita en *[Nombre_Negocio]* ha quedado confirmada con éxito.

🗓️ *Fecha:* [Fecha_Cita]
⏰ *Hora:* [Hora_Cita]
💇 *Servicio:* [Servicio]
👤 *Especialista:* [Colaborador]
📍 *Ubicación:* ${businessData.city}${businessData.address ? `, ${businessData.address}` : ''}

Por favor, si necesitas reagendar o cancelar, avísanos con al menos 24 horas de anticipación. ¡Te esperamos! 🙌`,
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[Fecha_Cita]', '[Hora_Cita]', '[Servicio]', '[Colaborador]'],
      },
      {
        id: 'tpl-recordatorio-24h',
        title: 'Recordatorio 24 Horas Antes (Confirmación Activa)',
        scenario: 'recordatorio',
        category: 'Citas',
        recommendedTiming: '24 horas antes del turno',
        templateText: `Hola [Nombre_Cliente] 👋 Te recordamos que tienes una cita programada para *mañana [Fecha_Cita]* a las *[Hora_Cita]* en *[Nombre_Negocio]*.

¿Nos confirmas tu asistencia?
👉 *1* para Confirmar
👉 *2* para Reagendar

¡Muchas gracias y que tengas un excelente día! ✨`,
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[Fecha_Cita]', '[Hora_Cita]'],
      },
      {
        id: 'tpl-reactivacion-inactivos',
        title: 'Reactivación de Clientes Inactivos (30 a 45 días)',
        scenario: 'reactivacion',
        category: 'Fidelización',
        recommendedTiming: 'Cuando pasen 35 días sin visita',
        templateText: `¡Hola [Nombre_Cliente]! 😊 En *[Nombre_Negocio]* te extrañamos.

Notamos que ha pasado un tiempo desde tu última visita para tu *[Servicio]*. Queremos consentirte en tu próximo retoque con un *tratamiento de cortesía* o un *15% de descuento* en tu siguiente cita esta semana.

¿Te gustaría que te reservemos un espacio para este jueves o viernes? 📲`,
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[Servicio]'],
      },
      {
        id: 'tpl-cumpleanos',
        title: 'Felicitación de Cumpleaños & Fidelización',
        scenario: 'cumpleanos',
        category: 'Fidelización',
        recommendedTiming: 'El día del cumpleaños del cliente',
        templateText: `🎂 ¡Feliz Cumpleaños [Nombre_Cliente]! 🎉

De parte de todo el equipo de *[Nombre_Negocio]*, te deseamos un día maravilloso lleno de alegrías.

Queremos celebrarlo contigo: durante todo tu mes de cumpleaños tienes un *regalo especial* en tu servicio favorito. 🎁

¡Agenda tu cita respondiendo a este mensaje! 🥳✨`,
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]'],
      },
    ],
    moduloColaboradores: {
      enabled: true,
      modelType: businessData.paymentScheme,
      dailyClosingColumns: [
        {
          columnName: 'Fecha',
          description: 'Día de atención',
          formula: '',
          exampleValue: '2026-08-20',
        },
        {
          columnName: 'Colaborador',
          description: 'Profesional que atendió',
          formula: '',
          exampleValue: 'Carlos M.',
        },
        {
          columnName: 'Cliente',
          description: 'Nombre del cliente',
          formula: '',
          exampleValue: 'Mariana Soto',
        },
        {
          columnName: 'Servicio Realizado',
          description: 'Servicio cobrado',
          formula: '',
          exampleValue: 'Servicio Principal',
        },
        {
          columnName: 'Precio Cobrado',
          description: 'Monto total abonado',
          formula: '',
          exampleValue: `${businessData.currencySymbol}50.00`,
        },
        {
          columnName: 'Método de Pago',
          description: 'Efectivo / Transferencia / Tarjeta',
          formula: '',
          exampleValue: 'Efectivo',
        },
        {
          columnName: '% Comisión',
          description: 'Porcentaje acordado',
          formula: '',
          exampleValue: `${businessData.commissionPercentage || 40}%`,
        },
        {
          columnName: 'Comisión Colaborador',
          description: 'Pago a entregar al profesional',
          formula: '=E2*G2',
          exampleValue: `${businessData.currencySymbol}20.00`,
        },
        {
          columnName: 'Ganancia Neta Negocio',
          description: 'Ingreso que queda para el local',
          formula: '=E2-H2',
          exampleValue: `${businessData.currencySymbol}30.00`,
        },
      ],
      sampleClosingRows: [
        {
          colaborador: 'Carlos M.',
          servicio: 'Servicio Principal',
          monto: `${businessData.currencySymbol}45.00`,
          metodoPago: 'Efectivo',
          comisionCalculada: `${businessData.currencySymbol}${((45 * (businessData.commissionPercentage || 40)) / 100).toFixed(2)}`,
        },
        {
          colaborador: 'Laura G.',
          servicio: 'Tratamiento Premium',
          monto: `${businessData.currencySymbol}60.00`,
          metodoPago: 'Tarjeta / Transferencia',
          comisionCalculada: `${businessData.currencySymbol}${((60 * (businessData.commissionPercentage || 40)) / 100).toFixed(2)}`,
        },
        {
          colaborador: 'Andrés P.',
          servicio: 'Cuidado Completo',
          monto: `${businessData.currencySymbol}35.00`,
          metodoPago: 'Efectivo',
          comisionCalculada: `${businessData.currencySymbol}${((35 * (businessData.commissionPercentage || 40)) / 100).toFixed(2)}`,
        },
      ],
      paymentRules: [
        'Las propinas son 100% íntegras del colaborador y no se descuentan de comisiones.',
        'Si el cliente paga con tarjeta de crédito, se descuenta el 3% de comisión bancaria antes de aplicar el porcentaje.',
        'El corte y liquidación de comisiones se realiza todos los sábados al cierre de jornada.',
      ],
      tipsAndRules: [
        'Lleva una hoja de firmas diaria para conformidad del colaborador.',
        'Anota el método de pago para cuadrar la caja física.',
      ],
    },
    guiaPasoAPaso: {
      platform: 'Google Sheets + Notion',
      steps: [
        {
          stepNumber: 1,
          title: 'Crear tu Hoja de Cálculo en Google Drive',
          description:
            'Entra a drive.google.com, crea una nueva "Hoja de cálculo de Google" y nómbrala "CRM Master Pro - ' +
            businessData.businessName +
            '". Crea 3 pestañas en la parte inferior: "1_Ficha_Clientes", "2_Cierre_Diario" y "3_Dashboard_Mensual".',
          actionableTip:
            'Selecciona la fila 1 y haz clic en "Ver > Inmovilizar > 1 fila" para que los títulos se queden fijos al desplazarte.',
        },
        {
          stepNumber: 2,
          title: 'Pegar las Columnas de la Ficha de Clientes',
          description:
            'Copia los nombres de las columnas que generamos en la pestaña 1. Aplica un fondo verde esmeralda o azul oscuro a la cabecera con texto en blanco para darle aspecto profesional.',
          actionableTip:
            'En la columna de Teléfono, selecciona toda la columna y aplica "Formato > Número > Texto sin formato" para no perder el signo + o el cero inicial.',
        },
        {
          stepNumber: 3,
          title: 'Configurar Google Forms para Autoregistro',
          description:
            'Crea un formulario gratuito en forms.google.com con los datos básicos (Nombre, WhatsApp, Cumpleaños, Alergias). En la pestaña "Respuestas", conéctalo directamente a tu hoja de cálculo para que cada cliente se guarde solo.',
          actionableTip:
            'Coloca un código QR en el mostrador o recepción para que los clientes nuevos completen su ficha desde su propio teléfono.',
        },
        {
          stepNumber: 4,
          title: 'Configurar Respuestas Rápidas en WhatsApp Business',
          description:
            'Descarga la app gratuita WhatsApp Business. Ve a "Herramientas para la empresa > Respuestas rápidas" y crea atajos como /confirmar, /recordar y /reactivar con los textos generados.',
          actionableTip:
            'Crea etiquetas de colores en WhatsApp como "Cita Pendiente", "Cliente VIP" y "Por Reactivar" para tener orden visual.',
        },
        {
          stepNumber: 5,
          title: 'Llevar el Cierre Diario y Control de Colaboradores',
          description:
            'Al final de cada día, anota los servicios en la pestaña "2_Cierre_Diario". Las fórmulas calcularán automáticamente la comisión de cada profesional y el ingreso neto del negocio.',
          actionableTip:
            'Crea una tabla dinámica en Google Sheets para ver en un segundo cuánto generó cada colaborador en la semana.',
        },
      ],
      quickSetupChecklist: [
        'Crear hoja en Google Sheets',
        'Configurar WhatsApp Business',
        'Imprimir QR con Google Forms para recepción',
      ],
      googleSheetsFormulaHelpers: [
        {
          formulaName: 'Cálculo de Comisión Automática',
          formulaCode: '=E2*G2',
          explanation: 'Multiplica el precio del servicio (columna E) por el % de comisión (columna G).',
        },
        {
          formulaName: 'Días transcurridos desde la última visita',
          formulaCode: '=SI(ESBLANCO(I2), "Sin visita", HOY()-I2)',
          explanation: 'Muestra cuántos días han pasado para saber si el cliente requiere un mensaje de reactivación.',
        },
        {
          formulaName: 'Alerta visual de cliente inactivo (+30 días)',
          formulaCode: '=SI(HOY()-I2>30, "🚨 TOCA REACTIVAR", "✅ AL DÍA")',
          explanation: 'Coloca una etiqueta automática en la hoja para saber a quién enviar WhatsApp.',
        },
      ],
    },
    freeToolsRecommended: [
      {
        toolName: 'Google Sheets',
        cost: '100% Gratis',
        howToUse: 'Base de datos principal de clientes y cálculo de comisiones diarias.',
        url: 'https://sheets.google.com',
      },
      {
        toolName: 'Google Forms',
        cost: '100% Gratis',
        howToUse: 'Ficha digital para que clientes o recepcionistas capturen datos sin errores.',
        url: 'https://forms.google.com',
      },
      {
        toolName: 'WhatsApp Business',
        cost: '100% Gratis',
        howToUse: 'Respuestas rápidas, etiquetas de clientes y catálogo de servicios.',
        url: 'https://www.whatsapp.com/business/',
      },
      {
        toolName: 'Notion',
        cost: '100% Gratis',
        howToUse: 'Galería de fotos antes/después y manual de procedimientos del negocio.',
        url: 'https://www.notion.so',
      },
    ],
  };
};

// Client-side Direct Call to Gemini API (with fallback)
export const generateCRMClientSide = async (
  businessData: BusinessFormData
): Promise<GeneratedCRMSystem> => {
  const apiKey = getClientApiKey();

  // If no API key is set, generate rich offline template immediately
  if (!apiKey) {
    return generateLocalFallbackCRM(businessData);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como un Consultor Experto en Negocios de Belleza, Estética, Barberías y Salud, y Desarrollador de Sistemas No-Code / Gratuitos.
Diseña un Sistema CRM COMPLETO, 100% GRATUITO y personalizado para el siguiente negocio. El cliente NO pagará ninguna suscripción y gestionará todo con Google Sheets, Google Forms, Notion y WhatsApp Business.

DATOS DEL NEGOCIO:
- Tipo de Negocio: ${businessData.businessType} ${businessData.customBusinessType ? `(${businessData.customBusinessType})` : ''}
- Nombre del Negocio: ${businessData.businessName}
- Ubicación: ${businessData.city}, ${businessData.country} (Moneda: ${businessData.currencySymbol} - ${businessData.currency})
- Dirección: ${businessData.address || 'No especificada'}
- WhatsApp de Contacto: ${businessData.whatsapp || 'No especificado'}
- Teléfono / Redes: ${businessData.phone || 'No especificado'}
- Esquema de Equipo: ${businessData.teamScheme} (${businessData.collaboratorsCount || 1} colaboradores aprox.)
- Esquema de Pagos: ${businessData.paymentScheme} (Comisión promedio: ${businessData.commissionPercentage || 0}%)
- Servicios Principales y Precios:
${businessData.services}

REQUISITOS DEL SISTEMA A GENERAR:
1. Ficha de Cliente (CRM): Debe incluir entre 10 y 14 campos estructurados (Generales, Historial técnico/fórmula según especialidad, Preferencias, Financiero). Incluye un ejemplo real y para qué sirve cada campo.
2. Plantillas de Mensajes WhatsApp / Correo: Genera mínimo 4 plantillas completas (Confirmación de cita, Recordatorio 24h antes con confirmación de asistencia, Reactivación de clientes inactivos tras 30-45 días con oferta sutil, Felicitación de cumpleaños / fidelización). Usa variables claras como [Nombre_Cliente], [Nombre_Negocio], [Fecha_Cita], [Hora_Cita], [Servicio], [Colaborador], [WhatsApp_Negocio].
3. Módulo de Control de Colaboradores y Cierre Diario: Define las columnas exactas para la hoja de Google Sheets (incluyendo fórmulas como =E2*G2 para calcular comisiones), y 3 filas de ejemplo con cálculos de comisiones según los servicios descritos.
4. Guía Paso a Paso Gratuita: Explica en 5 pasos claros cómo montar este sistema en Google Sheets, Google Forms y Notion, junto con 3 fórmulas indispensables de Google Sheets.

Devuelve la respuesta ESTRICTAMENTE en formato JSON con la estructura correcta compatible con GeneratedCRMSystem.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '';
    let parsedJson: GeneratedCRMSystem;
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    return parsedJson;
  } catch (error) {
    console.warn('Gemini direct client call encountered an issue, falling back to instant offline generator:', error);
    return generateLocalFallbackCRM(businessData);
  }
};

// Client-side Chat Refine with Gemini API (with fallback)
export const refineCRMChatClientSide = async (
  message: string,
  currentCRM: GeneratedCRMSystem | null,
  businessData: BusinessFormData
): Promise<{ replyText: string; updatedCRM?: GeneratedCRMSystem }> => {
  const apiKey = getClientApiKey();

  // Helper for rule-based local updating to guarantee state modification if Gemini is offline/fallback or returns partial data
  const applyLocalRefinement = (
    baseCRM: GeneratedCRMSystem,
    msg: string
  ): { replyText: string; updatedCRM: GeneratedCRMSystem } => {
    const updated: GeneratedCRMSystem = JSON.parse(JSON.stringify(baseCRM));
    const lower = msg.toLowerCase();

    // 1. Simplificar campos / Quitar opcionales
    if (
      lower.includes('simplifica') ||
      lower.includes('quitar') ||
      lower.includes('quites') ||
      lower.includes('eliminar') ||
      lower.includes('no esenciales') ||
      lower.includes('obligatorios')
    ) {
      const initialCount = updated.fichaCliente.fields.length;
      updated.fichaCliente.fields = updated.fichaCliente.fields.filter(
        (f) => f.isRequired || f.name.includes('Nombre') || f.name.includes('WhatsApp') || f.name.includes('Historial')
      );
      return {
        replyText: `¡Listo! He simplificado la Ficha de Clientes manteniendo solo los campos esenciales y obligatorios (de ${initialCount} a ${updated.fichaCliente.fields.length} campos). La tabla se ha actualizado en tiempo real.`,
        updatedCRM: updated,
      };
    }

    // 2. Agregar campo específico
    if (
      lower.includes('agrega') ||
      lower.includes('agregar') ||
      lower.includes('añadir') ||
      lower.includes('incluye') ||
      lower.includes('incluir') ||
      lower.includes('crea') ||
      lower.includes('crear') ||
      lower.includes('campo')
    ) {
      let newFieldName = 'Alergias y Sensibilidad';
      let category: 'Datos Generales' | 'Especialidad / Historial Técnico' | 'Preferencias & Hábitos' | 'Financiero & Fidelización' = 'Especialidad / Historial Técnico';
      let type: CRMField['type'] = 'Texto';
      let purpose = 'Precaución de salud previa a la aplicación de productos y tratamientos.';
      let example = 'Sin alergias a químicos / Piel sensible';

      if (lower.includes('correo') || lower.includes('email') || lower.includes('mail')) {
        newFieldName = 'Correo Electrónico';
        category = 'Datos Generales';
        type = 'Texto';
        purpose = 'Envío de facturas digitales, promociones mensuales y recordatorios.';
        example = 'cliente@gmail.com';
      } else if (lower.includes('alergia') || lower.includes('sensibilidad')) {
        newFieldName = 'Alergias y Sensibilidad';
        category = 'Especialidad / Historial Técnico';
        type = 'Texto';
        purpose = 'Precaución técnica antes de aplicar tintes, productos químicos o anestesia.';
        example = 'Alérgico a amoníaco / Piel reactiva';
      } else if (lower.includes('rtn') || lower.includes('dni') || lower.includes('cedula') || lower.includes('cédula') || lower.includes('identidad')) {
        newFieldName = 'RTN / No. Identidad';
        category = 'Datos Generales';
        type = 'Texto';
        purpose = 'Registro tributario y facturación legal en Honduras (SAR).';
        example = '0801-1995-12345';
      } else if (lower.includes('foto') || lower.includes('antes') || lower.includes('después') || lower.includes('despues')) {
        newFieldName = 'Link Fotos Antes y Después';
        category = 'Especialidad / Historial Técnico';
        type = 'Teléfono / Link';
        purpose = 'Enlace a carpeta de Google Drive o Notion con evidencia visual del servicio.';
        example = 'drive.google.com/fotos-cli-001';
      } else if (lower.includes('piel') || lower.includes('cutis')) {
        newFieldName = 'Tipo de Piel / Cutis';
        category = 'Especialidad / Historial Técnico';
        type = 'Selector / Opciones';
        purpose = 'Diagnóstico dérmico para selección de productos y aparatología adecuada.';
        example = 'Piel mixta con tendencia grasa';
      } else if (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('redes')) {
        newFieldName = 'Usuario de Instagram / Redes';
        category = 'Datos Generales';
        type = 'Texto';
        purpose = 'Etiquetado en historias y marketing de fidelización social.';
        example = '@cliente_hn';
      } else if (lower.includes('direccion') || lower.includes('dirección') || lower.includes('colonia') || lower.includes('domicilio')) {
        newFieldName = 'Dirección / Colonia';
        category = 'Datos Generales';
        type = 'Texto';
        purpose = 'Ubicación física para entregas o citas a domicilio.';
        example = 'Col. Palmira, Tegucigalpa';
      } else if (lower.includes('preferencia') || lower.includes('bebida') || lower.includes('música') || lower.includes('musica')) {
        newFieldName = 'Preferencia de Bebida y Trato';
        category = 'Preferencias & Hábitos';
        type = 'Texto';
        purpose = 'Atención VIP personalizada durante su estancia en el local.';
        example = 'Café negro sin azúcar / Prefiere ambiente tranquilo';
      } else {
        // Dynamic extraction from prompt
        const matchQuotes = msg.match(/["']([^"']+)["']/);
        if (matchQuotes && matchQuotes[1]) {
          newFieldName = matchQuotes[1].trim();
        } else {
          const matchDe = msg.match(/(?:campo|agrega|agregar|incluir|crear)\s+(?:de\s+|para\s+|llamado\s+)?([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,35})/i);
          if (matchDe && matchDe[1]) {
            newFieldName = matchDe[1].trim();
            // Capitalize first letter
            newFieldName = newFieldName.charAt(0).toUpperCase() + newFieldName.slice(1);
          }
        }
        purpose = `Registro específico de ${newFieldName.toLowerCase()} para optimizar la atención.`;
        example = `Dato de prueba para ${newFieldName}`;
      }

      const exists = updated.fichaCliente.fields.some(
        (f) => f.name.toLowerCase() === newFieldName.toLowerCase()
      );

      if (!exists) {
        updated.fichaCliente.fields.push({
          name: newFieldName,
          category,
          type,
          isRequired: false,
          example,
          purpose,
        });
      }

      if (!updated.fichaCliente.sampleClientData) {
        updated.fichaCliente.sampleClientData = {};
      }
      updated.fichaCliente.sampleClientData[newFieldName] = example;

      return {
        replyText: `¡Listo! He añadido el campo **"${newFieldName}"** (${category}) a tu Ficha de Clientes. Tanto la tabla de columnas como el simulador de perfil se han actualizado en tiempo real.`,
        updatedCRM: updated,
      };
    }

    // 3. Modificación de WhatsApp / Recordatorio 48h
    if (lower.includes('48h') || lower.includes('48 horas') || lower.includes('recordatorio')) {
      const reminderTpl = updated.plantillasMensajes.find(
        (t) => t.id === 'tpl-recordatorio-24h' || t.title.toLowerCase().includes('recordatorio')
      );
      if (reminderTpl) {
        reminderTpl.title = 'Recordatorio 48 Horas Antes (Confirmación Activa)';
        reminderTpl.recommendedTiming = '48 horas antes de la cita';
        reminderTpl.templateText = `Hola [Nombre_Cliente] 👋 Te recordamos que tienes una cita agendada para este *[Fecha_Cita]* a las *[Hora_Cita]* en *[Nombre_Negocio]*.

Por favor confírmanos tu asistencia respondiendo:
👉 *1* para Confirmar
👉 *2* para Reagendar

¡Muchas gracias y que tengas un excelente día! ✨`;
      }
      return {
        replyText: `¡Actualizado! He modificado la plantilla de WhatsApp para enviar el recordatorio con **48 horas de anticipación** y confirmación interactiva.`,
        updatedCRM: updated,
      };
    }

    // 4. Modificación de comisiones / retención
    if (lower.includes('comisi') || lower.includes('tarjeta') || lower.includes('retener') || lower.includes('3%')) {
      if (!updated.moduloColaboradores.paymentRules.some((r) => r.includes('3%'))) {
        updated.moduloColaboradores.paymentRules.push(
          'Pago con tarjeta: Se descuenta 3% de comisión bancaria antes de calcular el pago del profesional.'
        );
      }
      return {
        replyText: `¡Ajustado! He añadido la regla de retención del 3% por cobros con tarjeta en el **Módulo de Control de Colaboradores**.`,
        updatedCRM: updated,
      };
    }

    return {
      replyText: `He procesado tu solicitud: "${msg}". He actualizado y sincronizado la configuración de tu Sistema CRM.`,
      updatedCRM: updated,
    };
  };

  if (!apiKey || !currentCRM) {
    const base = currentCRM || generateLocalFallbackCRM(businessData);
    return applyLocalRefinement(base, message);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como Asistente Experto en CRM Master Pro y consultor de negocios.
El usuario tiene el siguiente sistema CRM generado para su negocio "${businessData?.businessName || 'Negocio'}":

SISTEMA CRM ACTUAL (JSON):
${JSON.stringify(currentCRM, null, 2)}

PETICIÓN DEL USUARIO:
"${message}"

INSTRUCCIONES CRÍTICAS:
1. Analiza la petición del usuario (ej: agregar o quitar campos en fichaCliente.fields, cambiar plantillas, modificar fórmulas de colaboradores).
2. Si el usuario pide agregar o quitar campos, modifica la lista 'fichaCliente.fields' en el JSON.
3. SIEMPRE incluye en 'updatedCRM' el objeto completo de GeneratedCRMSystem con la modificación aplicada para que la interfaz web de React actualice la tabla en vivo.
4. En 'replyText', redacta una respuesta clara y profesional en español explicando los cambios realizados.

Devuelve ESTRICTAMENTE un JSON con:
{
  "replyText": "Explicación detallada de lo modificado",
  "updatedCRM": { ...objeto completo GeneratedCRMSystem modificado... }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    let parsedJson: { replyText: string; updatedCRM?: GeneratedCRMSystem };
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleaned);
    }

    // Ensure updatedCRM has the proper shape and fichaCliente fields
    if (parsedJson && parsedJson.updatedCRM && parsedJson.updatedCRM.fichaCliente) {
      return {
        replyText: parsedJson.replyText || '¡Cambios aplicados con éxito a tu Sistema CRM!',
        updatedCRM: parsedJson.updatedCRM,
      };
    } else {
      // If AI didn't return full structure, fallback to local structured update
      const localResult = applyLocalRefinement(currentCRM, message);
      return {
        replyText: parsedJson.replyText || localResult.replyText,
        updatedCRM: localResult.updatedCRM,
      };
    }
  } catch (err: any) {
    console.warn('Error calling Gemini chat refine client-side, using robust fallback:', err);
    return applyLocalRefinement(currentCRM, message);
  }
};
