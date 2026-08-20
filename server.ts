import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Mock/fallback generation will be used if needed.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `Eres 'CRM Master Pro', un asistente virtual especializado en diseñar y gestionar sistemas CRM personalizados para negocios de belleza, cuidado personal, salud e higiene (Barberías, Clínicas de Estética, Spas, Estilistas Independientes y Clínicas Dentales).

REGLA DE ORO DE HERRAMIENTAS:
Debes trabajar EXCLUSIVAMENTE con herramientas, plataformas y metodologías 100% GRATUITAS (como Google Sheets, Notion Gratis, WhatsApp Business, Google Forms, AppSheet en plan de desarrollo, etc.). Queda estrictamente prohibido recomendar software o aplicaciones de pago por suscripción.

MODO DE INTERACCIÓN:
Una vez que el usuario envíe los datos de su negocio, debes generar una respuesta estructurada en formato JSON puro que incluya:

1. FICHA DE CLIENTE (CRM):
   - Tabla estructurada con los campos recomendados según su tipo de negocio.
   - Para BARBERÍA: Estilos de corte, frecuencia de degradado/fade, barba, productos favoritos, navaja/cuidado piel.
   - Para CLÍNICA DE BELLEZA / ESTÉTICA: Historial de tratamientos, tipo de piel, alergias, productos aplicados, seguimiento, consentimiento informado.
   - Para ESTILISTA INDEPENDIENTE: Fórmulas de tinte/colorimetría, procesos químicos, tiempos de exposición, diagnóstico capilar.
   - Para CLÍNICA DENTAL: Antecedentes médicos/alergias, piezas tratadas (odontograma), plan por fases, presupuesto pendiente, limpiezas y radiografías.
   - Para SPA / MASAJES: Nivel de presión preferido, zonas de dolor/tensión, esencias/aceites favoritos, contraindicaciones médicas.
   - Para UÑAS / PESTAÑAS: Tipo de aplicación (acrílico, gel, soft gel, extensiones), curvatura/longitud, alergias a pegamentos/monómero, retoques.
   - Incluye la nota editable obligatoria: 'Si deseas agregar, modificar o borrar algún campo, indícalo en el chat'.
   - Incluye un ejemplo completo de cliente ficticio llenando todos los campos ('sampleClientData').

2. PLANTILLAS DE COMUNICACIÓN POR WHATSAPP Y CORREO:
   - Mensajes con etiquetas dinámicas como [Nombre_Cliente], [Nombre_Negocio], [Fecha_Cita], [Hora_Cita], [Servicio], [Colaborador], [WhatsApp_Negocio], [Direccion_Negocio].
   - Mensajes listos para: Confirmación de cita inmediata, Recordatorio 24h antes (con llamada a la acción), Reactivación por inactividad (30-45 días) con incentivo de fidelidad, y Felicitación de Cumpleaños / Descuento especial.

3. MÓDULO DE CONTROL DE EMPLEADOS / COLABORADORES:
   - Formato de cierre diario: columnas para fecha, colaborador, cliente, servicio, monto cobrado en moneda local, método de pago (Efectivo, Tarjeta, Transferencia), % comisión, comisión calculada, monto para el negocio.
   - Fórmulas de Google Sheets recomendadas (por ejemplo: =SUM(...), =C2*0.40).
   - Ejemplo de 3 a 4 filas de cierre de caja diario.

4. INSTRUCCIONES Y GUÍA GRATUITA PASO A PASO:
   - Explicación clara y detallada de cómo montar esta estructura sin costo usando Google Sheets, Google Forms para autocaptura de clientes, y WhatsApp Business con respuestas rápidas y etiquetas.`;

// Endpoint: Generate Full CRM System
app.post('/api/generate-crm', async (req, res) => {
  try {
    const businessData = req.body;
    const ai = getAI();

    const prompt = `Genera el Sistema CRM Gratuito completo y altamente personalizado para el siguiente negocio:
Nombre del Negocio: ${businessData.businessName || 'Mi Negocio'}
Tipo de Negocio: ${businessData.businessType} ${businessData.customBusinessType ? `(${businessData.customBusinessType})` : ''}
Ubicación: ${businessData.city}, ${businessData.country} (Moneda: ${businessData.currencySymbol || '$'} ${businessData.currency || 'USD'})
Canales de Contacto: WhatsApp: ${businessData.whatsapp || 'No especificado'}, Tel: ${businessData.phone || 'No especificado'}, Dirección: ${businessData.address || 'No especificada'}
Equipo / Colaboradores: ${businessData.teamScheme} (${businessData.collaboratorsCount || 1} personas)
Esquema de Pago: ${businessData.paymentScheme} (Comisión: ${businessData.commissionPercentage || 0}%, Renta: ${businessData.spaceRentCost || 'N/A'})
Servicios Principales y Precios: ${businessData.services || 'Servicios generales'}
Notas adicionales: ${businessData.notes || 'Ninguna'}

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "businessSummary": {
    "name": string,
    "typeLabel": string,
    "location": string,
    "currency": string,
    "recommendation": string
  },
  "fichaCliente": {
    "title": string,
    "description": string,
    "fields": [
      {
        "name": string,
        "type": "Texto" | "Número" | "Fecha" | "Selector / Opciones" | "Fórmula" | "Booleano / Casilla" | "Teléfono / Link",
        "category": "Datos Generales" | "Especialidad / Historial Técnico" | "Preferencias & Hábitos" | "Financiero & Fidelización",
        "example": string,
        "purpose": string,
        "options": string[],
        "isRequired": boolean
      }
    ],
    "note": "Si deseas agregar, modificar o borrar algún campo, indícalo en el chat.",
    "sampleClientData": { [fieldName: string]: string }
  },
  "plantillasMensajes": [
    {
      "id": string,
      "title": string,
      "scenario": "confirmacion" | "recordatorio" | "reactivacion" | "cumpleanos" | "post_servicio",
      "templateText": string,
      "variables": string[],
      "recommendedTiming": string,
      "category": "Citas" | "Seguimiento" | "Fidelización"
    }
  ],
  "moduloColaboradores": {
    "enabled": boolean,
    "modelType": string,
    "dailyClosingColumns": [
      {
        "columnName": string,
        "description": string,
        "formula": string,
        "exampleValue": string
      }
    ],
    "paymentRules": string[],
    "sampleClosingRows": [
      {
        "colaborador": string,
        "servicio": string,
        "monto": string,
        "metodoPago": string,
        "comisionCalculada": string
      }
    ],
    "tipsAndRules": string[]
  },
  "guiaPasoAPaso": {
    "platform": "Google Sheets & WhatsApp Business (100% Gratis)",
    "steps": [
      {
        "stepNumber": number,
        "title": string,
        "description": string,
        "actionableTip": string
      }
    ],
    "quickSetupChecklist": string[],
    "googleSheetsFormulaHelpers": [
      {
        "formulaName": string,
        "formulaCode": string,
        "explanation": string
      }
    ]
  },
  "freeToolsRecommended": [
    {
      "toolName": string,
      "url": string,
      "howToUse": string,
      "cost": "100% Gratis"
    }
  ]
}`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, data: parsedData });
    } else {
      // High-quality local fallback generator if no API key is present during initial build/offline test
      const fallbackData = generateSmartFallback(businessData);
      return res.json({ success: true, data: fallbackData });
    }
  } catch (error: any) {
    console.error('Error generating CRM:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al generar el CRM con IA',
    });
  }
});

// Endpoint: Chat Refinement (Modify fields, update messages, answer queries)
app.post('/api/chat-refine', async (req, res) => {
  try {
    const { message, currentCRM, businessData, chatHistory } = req.body;
    const ai = getAI();

    const prompt = `El usuario tiene el siguiente Sistema CRM generado:
Datos del Negocio: ${JSON.stringify(businessData || {})}
CRM Actual: ${JSON.stringify(currentCRM || {})}

Historial de conversación:
${(chatHistory || []).map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n')}

Nuevo mensaje del usuario: "${message}"

INSTRUCCIONES:
1. Responde de manera profesional, amable, directa y especializada como consultor de CRM Master Pro.
2. Si el usuario solicita modificar, agregar o quitar campos de la Ficha de Cliente, redactar o cambiar plantillas de WhatsApp, modificar reglas de comisión de colaboradores, o ajustar la guía, debes actualizar el objeto 'updatedCRM' con los cambios aplicados.
3. Si solo hizo una consulta informativa o pregunta, responde a su duda y mantén 'updatedCRM' igual o null.

Devuelve ÚNICAMENTE un JSON con:
{
  "replyText": string (Tu respuesta explicativa en markdown con estilo profesional y consejos útiles),
  "updatedCRM": object | null (El objeto CRMSystem completo actualizado si hubo cambios en la estructura, campos, plantillas o fórmulas; o null si fue solo una duda)
}`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsedData });
    } else {
      // Local fallback for offline testing
      return res.json({
        success: true,
        data: {
          replyText: `He registrado tu solicitud: "${message}". Como estamos en modo desarrollo local sin API Key, puedes personalizar los campos directamente en las pestañas interactivas.`,
          updatedCRM: null,
        },
      });
    }
  } catch (error: any) {
    console.error('Error in chat refine:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el mensaje en el chat',
    });
  }
});

// Helper for high-quality instant fallback
function generateSmartFallback(b: any) {
  const symbol = b.currencySymbol || '$';
  const name = b.businessName || 'Tu Negocio';
  const isBarber = b.businessType === 'barberia';
  const isDental = b.businessType === 'clinica_dental';
  const isHair = b.businessType === 'estilista_independiente';
  const isBeauty = b.businessType === 'clinica_belleza';

  const typeLabels: Record<string, string> = {
    barberia: 'Barbería Tradicional & Moderna',
    clinica_belleza: 'Clínica de Estética & Cuidado Facial',
    estilista_independiente: 'Estudio de Estilismo & Colorimetría',
    clinica_dental: 'Clínica Odontológica & Salud Dental',
    spa_masajes: 'Spa & Terapias de Relajación',
    unas_pestanas: 'Estudio de Uñas & Mirada',
    otro: 'Centro de Salud y Bienestar',
  };

  const specificFields = isBarber
    ? [
        { name: 'Estilo de Corte / Degradado Favorito', type: 'Selector / Opciones', category: 'Especialidad / Historial Técnico', example: 'Mid Fade con textura en corona', options: ['Low Fade', 'Mid Fade', 'High Fade', 'Taper Fade', 'Clásico con tijera', 'Buzz Cut'], purpose: 'Asegurar que cualquier barbero replique el corte exacto', isRequired: true },
        { name: 'Tipo de Barba & Perfilado', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Perfilado con navaja, degradado en patillas, longitud 4mm', purpose: 'Detallar línea de mejillas y rebaje', isRequired: false },
        { name: 'Sensibilidad en la Piel / Alergias', type: 'Texto', category: 'Preferencias & Hábitos', example: 'Irritación con aftershave alcohólico, usar toalla tibia suave', purpose: 'Evitar foliculitis o cortes en piel sensible', isRequired: true },
        { name: 'Frecuencia de Visita', type: 'Selector / Opciones', category: 'Preferencias & Hábitos', example: 'Cada 15 días', options: ['Semanal', 'Cada 15 días', 'Mensual', 'Ocasional'], purpose: 'Programar recordatorio automático de WhatsApp', isRequired: true },
        { name: 'Productos Comprados / Favoritos', type: 'Texto', category: 'Financiero & Fidelización', example: 'Cera mate Fijación Fuerte + Aceite de Eucalipto', purpose: 'Impulsar venta cruzada de productos para el hogar', isRequired: false },
      ]
    : isDental
    ? [
        { name: 'Antecedentes Médicos & Alergias', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Alergia a la Penicilina, Hipertensión controlada', purpose: 'Seguridad clínica del paciente antes de anestesia o fármacos', isRequired: true },
        { name: 'Motivo de Consulta & Piezas Tratadas', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Pieza 3.6 Resina Oclusal, Pieza 1.1 Limpieza ultrasónica', purpose: 'Registro en ficha dental y odontograma', isRequired: true },
        { name: 'Plan de Tratamiento & Fases', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Fase 1: Profilaxis (Hecho) | Fase 2: Blanqueamiento (Pendiente)', purpose: 'Seguimiento clínico y retención', isRequired: true },
        { name: 'Presupuesto Total y Saldo Pendiente', type: 'Número', category: 'Financiero & Fidelización', example: `${symbol}120.00 de ${symbol}350.00`, purpose: 'Control de pagos por fase de tratamiento', isRequired: true },
        { name: 'Fecha Próxima Limpieza / Revisión (6 Meses)', type: 'Fecha', category: 'Preferencias & Hábitos', example: '2026-10-15', purpose: 'Reactivación automática de citas preventivas', isRequired: true },
      ]
    : isHair
    ? [
        { name: 'Fórmula de Tinte & Colorimetría', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Raíz: 6.1 + 20vol (35 min) | Medios y Puntas: 8.21 + 10vol matiz', purpose: 'Garantizar el mismo tono exacto en retoques de raíz', isRequired: true },
        { name: 'Historial de Procesos Químicos', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Decoloración previa hace 4 meses, Alisado de Keratina en 2025', purpose: 'Evitar sobreprocesar cabello sensibilizado', isRequired: true },
        { name: 'Diagnóstico Capilar / Porosidad', type: 'Selector / Opciones', category: 'Especialidad / Historial Técnico', example: 'Porosidad Alta / Cuero cabelludo seco', options: ['Baja', 'Media', 'Alta / Muy dañado', 'Graso', 'Sensible'], purpose: 'Recomendar tratamientos de reconstrucción adecuados', isRequired: true },
        { name: 'Bebida de Preferencia & Charla', type: 'Texto', category: 'Preferencias & Hábitos', example: 'Café negro con endulzante, prefiere sesión tranquila/silenciosa', purpose: 'Experiencia VIP altamente personalizada', isRequired: false },
      ]
    : [
        { name: 'Tipo de Piel / Fototipo', type: 'Selector / Opciones', category: 'Especialidad / Historial Técnico', example: 'Mixta a Grasa, Fototipo III', options: ['Seca', 'Grasa', 'Mixta', 'Sensible / Rosácea', 'Madura'], purpose: 'Elegir activos y cosmecéuticos correctos', isRequired: true },
        { name: 'Alergias a Activos / Cosméticos', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Alergia a Ácido Salicílico o Fragancias fuertes', purpose: 'Evitar reacciones alérgicas o quemaduras químicas', isRequired: true },
        { name: 'Historial de Tratamientos Aplicados', type: 'Texto', category: 'Especialidad / Historial Técnico', example: 'Limpieza profunda con punta de diamante + Peeling enzimático', purpose: 'Registro de evolución y fotos de antes/después', isRequired: true },
        { name: 'Rutina Facial en Casa', type: 'Texto', category: 'Preferencias & Hábitos', example: 'Limpiador en gel, Niacinamida, Protector solar SPF 50', purpose: 'Venta de productos de apoyo domiciliario', isRequired: false },
      ];

  const baseFields = [
    { name: 'ID Cliente / Código', type: 'Texto' as const, category: 'Datos Generales' as const, example: 'CLI-001', purpose: 'Identificador único en Google Sheets', isRequired: true },
    { name: 'Nombre Completo', type: 'Texto' as const, category: 'Datos Generales' as const, example: 'María Fernanda Gómez', purpose: 'Trato personalizado', isRequired: true },
    { name: 'WhatsApp / Teléfono', type: 'Teléfono / Link' as const, category: 'Datos Generales' as const, example: '+52 55 1234 5678', purpose: 'Envío de confirmaciones y recordatorios', isRequired: true },
    { name: 'Fecha de Nacimiento / Cumpleaños', type: 'Fecha' as const, category: 'Datos Generales' as const, example: '1992-04-18', purpose: 'Fidelización con felicitación y regalo/descuento', isRequired: false },
    ...specificFields.map((f) => ({ ...f, isRequired: f.isRequired ?? true })),
    { name: 'Total Invertido Histórico', type: 'Fórmula' as const, category: 'Financiero & Fidelización' as const, example: `${symbol}1,450.00`, purpose: 'Identificar a tus clientes VIP / Mayor ticket', isRequired: false },
    { name: 'Última Fecha de Visita', type: 'Fecha' as const, category: 'Financiero & Fidelización' as const, example: '2026-08-10', purpose: 'Detectar inactividad para campaña de reactivación', isRequired: true },
    { name: 'Nivel de Fidelidad / Etiqueta', type: 'Selector / Opciones' as const, category: 'Financiero & Fidelización' as const, example: 'Cliente VIP', options: ['Nuevo', 'Frecuente', 'VIP', 'En Riesgo de Inactividad', 'Inactivo'], purpose: 'Segmentar promociones en WhatsApp Business', isRequired: true },
  ];

  return {
    businessSummary: {
      name,
      typeLabel: typeLabels[b.businessType] || 'Centro de Cuidado Personal',
      location: `${b.city || 'Ciudad'}, ${b.country || 'País'}`,
      currency: `${symbol} (${b.currency || 'Moneda Local'})`,
      recommendation: `Sistema CRM optimizado al 100% en Google Sheets y WhatsApp Business, configurado para ${b.collaboratorsCount || 1} colaborador(es) y esquema de ${b.paymentScheme}.`,
    },
    fichaCliente: {
      title: `Ficha Técnica & CRM: ${name}`,
      description: `Estructura de base de datos con ${baseFields.length} campos esenciales diseñada para registrar el perfil completo de cada cliente sin pagar suscripciones.`,
      fields: baseFields,
      note: 'Si deseas agregar, modificar o borrar algún campo, indícalo en el chat.',
      sampleClientData: {
        'ID Cliente / Código': 'CLI-1024',
        'Nombre Completo': 'Carolina Salazar',
        'WhatsApp / Teléfono': '+1 (555) 349-2810',
        'Fecha de Nacimiento / Cumpleaños': '1995-09-14',
        'Nivel de Fidelidad / Etiqueta': 'VIP',
        'Última Fecha de Visita': '2026-08-12',
        'Total Invertido Histórico': `${symbol}320.00`,
      },
    },
    plantillasMensajes: [
      {
        id: 'msg-confirmacion',
        title: 'Confirmación de Cita Inmediata',
        scenario: 'confirmacion',
        category: 'Citas',
        recommendedTiming: 'Inmediatamente al agendar la cita',
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[Fecha_Cita]', '[Hora_Cita]', '[Servicio]', '[Colaborador]', '[Direccion_Negocio]'],
        templateText: `¡Hola [Nombre_Cliente]! ✨ Tu cita en *[Nombre_Negocio]* ha quedado confirmada con éxito.

🗓 *Fecha:* [Fecha_Cita]
⏰ *Hora:* [Hora_Cita]
💇‍♀️ *Servicio:* [Servicio]
👤 *Especialista:* [Colaborador]
📍 *Ubicación:* [Direccion_Negocio]

💡 *Recomendación:* Por favor llega 5 minutos antes para brindarte la mejor atención. Si necesitas reprogramar, avísanos con anticipación. ¡Te esperamos!`,
      },
      {
        id: 'msg-recordatorio',
        title: 'Recordatorio 24h Antes con Botón de Confirmación',
        scenario: 'recordatorio',
        category: 'Citas',
        recommendedTiming: '24 horas antes del horario agendado',
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[Hora_Cita]', '[Servicio]'],
        templateText: `¡Hola [Nombre_Cliente]! 👋 Te recordamos que tienes una cita mañana en *[Nombre_Negocio]*.

⏰ *Hora:* [Hora_Cita]
✂️ *Servicio:* [Servicio]

Por favor respóndenos a este mensaje con:
1️⃣ *CONFIRMO* para apartar tu espacio.
2️⃣ *REPROGRAMAR* si necesitas cambiar de horario.

¡Queremos consentirte como te mereces!`,
      },
      {
        id: 'msg-reactivacion',
        title: 'Reactivación por Inactividad (30 a 45 días sin visita)',
        scenario: 'reactivacion',
        category: 'Seguimiento',
        recommendedTiming: '30 o 45 días después de su última visita',
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]', '[WhatsApp_Negocio]'],
        templateText: `¡Hola [Nombre_Cliente]! En *[Nombre_Negocio]* te extrañamos mucho. 🥰

Notamos que ha pasado un tiempo desde tu última visita y queremos que te sigas sintiendo espectacular. 

🎁 Tenemos un *15% de descuento especial* en tu próximo servicio si agendas esta semana.

¿Te gustaría que te reservemos un espacio para este fin de semana? Respóndenos directamente a este WhatsApp: [WhatsApp_Negocio]`,
      },
      {
        id: 'msg-cumpleanos',
        title: 'Felicitación de Cumpleaños & Regalo de Fidelización',
        scenario: 'cumpleanos',
        category: 'Fidelización',
        recommendedTiming: 'El día de su cumpleaños (o durante el mes)',
        variables: ['[Nombre_Cliente]', '[Nombre_Negocio]'],
        templateText: `🎂 ¡Feliz Cumpleaños, [Nombre_Cliente]! 🎉

Todo el equipo de *[Nombre_Negocio]* te desea un día maravilloso lleno de alegría y momentos inolvidables.

🥳 Para celebrarte como te mereces, tienes un *Servicio de Hidratación / Regalo Sorpresa 100% GRATIS* o un *20% de descuento* en tu tratamiento favorito válido durante todo tu mes de cumpleaños.

¡Ven a consentirte con nosotros! Agenda tu cita respondiendo a este mensaje. ✨`,
      },
    ],
    moduloColaboradores: {
      enabled: true,
      modelType: b.paymentScheme === 'comision' ? `Comisión del ${b.commissionPercentage || 40}% por servicio` : b.paymentScheme,
      dailyClosingColumns: [
        { columnName: 'Fecha', description: 'Día del servicio', formula: 'Manual o =TODAY()', exampleValue: '2026-08-19' },
        { columnName: 'Colaborador', description: 'Nombre del profesional', formula: 'Lista desplegable', exampleValue: 'Alejandro M.' },
        { columnName: 'Cliente', description: 'Nombre del cliente atendido', formula: 'Texto', exampleValue: 'Carlos Mendoza' },
        { columnName: 'Servicio Realizado', description: 'Descripción del trabajo', formula: 'Texto / Selector', exampleValue: 'Corte + Barba Premium' },
        { columnName: `Monto Total (${symbol})`, description: 'Cobro total al cliente', formula: 'Número', exampleValue: `${symbol}35.00` },
        { columnName: 'Método de Pago', description: 'Efectivo, Tarjeta o Transferencia', formula: 'Selector', exampleValue: 'Efectivo' },
        { columnName: `% Comisión`, description: 'Porcentaje acordado', formula: 'Número', exampleValue: `${b.commissionPercentage || 40}%` },
        { columnName: `Pago Colaborador (${symbol})`, description: 'Ganancia del trabajador', formula: '=E2*G2', exampleValue: `${symbol}14.00` },
        { columnName: `Ganancia Negocio (${symbol})`, description: 'Ingreso neto del negocio', formula: '=E2-H2', exampleValue: `${symbol}21.00` },
      ],
      paymentRules: [
        'Los pagos con tarjeta tienen una deducción previa de comisión bancaria (3%) antes de calcular la comisión del colaborador.',
        'El cálculo de propinas es 100% íntegro para el colaborador que brindó la atención.',
        'El corte de caja se realiza al finalizar cada turno con el total de efectivo vs ventas registradas.',
      ],
      sampleClosingRows: [
        { colaborador: 'Alejandro M.', servicio: 'Corte Degradado + Barba', monto: `${symbol}35.00`, metodoPago: 'Efectivo', comisionCalculada: `${symbol}14.00 (40%)` },
        { colaborador: 'Sofia R.', servicio: 'Tinte Completo + Brushing', monto: `${symbol}80.00`, metodoPago: 'Tarjeta', comisionCalculada: `${symbol}32.00 (40%)` },
        { colaborador: 'Alejandro M.', servicio: 'Perfilado de Cejas & Barba', monto: `${symbol}20.00`, metodoPago: 'Transferencia', comisionCalculada: `${symbol}8.00 (40%)` },
      ],
      tipsAndRules: [
        'Usa la fórmula =SUMIF(B:B, "Alejandro M.", H:H) para saber exactamente cuánto pagarle a cada profesional al final del día.',
        'Crea una pestaña por cada colaborador en Google Sheets para que tengan total transparencia sobre sus ganancias.',
      ],
    },
    guiaPasoAPaso: {
      platform: 'Google Sheets, Google Forms y WhatsApp Business (100% Gratis)',
      steps: [
        {
          stepNumber: 1,
          title: 'Crear tu Base de Datos en Google Sheets',
          description: 'Crea una hoja de cálculo gratuita en Google Drive. Agrega como encabezados de la fila 1 exactamente los nombres de los campos de la "Ficha de Cliente" generada.',
          actionableTip: 'Congela la primera fila (Ver > Inmovilizar > 1 fila) y dale un color corporativo a los encabezados.',
        },
        {
          stepNumber: 2,
          title: 'Vincular un Google Form para Captura Rápida',
          description: 'En Google Sheets ve a "Herramientas > Crear un formulario". Los campos del formulario se enviarán en tiempo real a tu hoja de cálculo, permitiendo que recepcionistas o tú mismo registren clientes desde el celular.',
          actionableTip: 'Puedes poner un código QR en tu mostrador para que los clientes nuevos se registren ellos mismos y obtengan su descuento de bienvenida.',
        },
        {
          stepNumber: 3,
          title: 'Configurar Respuestas Rápidas en WhatsApp Business',
          description: 'Descarga WhatsApp Business (es 100% gratis). Ve a "Herramientas para la empresa > Respuestas rápidas" y guarda las plantillas generadas usando atajos como /confirmar, /recordar y /cumple.',
          actionableTip: 'Crea etiquetas de colores en WhatsApp como: "Cita Pendiente", "VIP", "Por Reactivar" y "Colaboradores".',
        },
        {
          stepNumber: 4,
          title: 'Control Diario de Finanzas y Colaboradores',
          description: 'Crea una segunda pestaña en tu Google Sheet llamada "Cierre Diario". Usa la tabla de colaboradores para registrar cada servicio cobrado y automatizar las comisiones con la fórmula =E2*G2.',
          actionableTip: 'Usa una tabla dinámica o la fórmula =SUMIFS para tener un reporte automático de ingresos mensuales por servicio.',
        },
      ],
      quickSetupChecklist: [
        'Hoja de Google Sheets creada y compartida con tu equipo con permisos de edición.',
        'Formulario de Google Forms vinculado para registro rápido sin errores.',
        'WhatsApp Business instalado con Respuestas Rápidas cargadas.',
        'Etiquetas de colores configuradas en WhatsApp para clasificar a los clientes.',
        'Pestaña de Cierre Diario y Comisiones lista para registrar el primer día.',
      ],
      googleSheetsFormulaHelpers: [
        {
          formulaName: 'Cálculo de Comisión Automática',
          formulaCode: '=E2 * G2',
          explanation: 'Multiplica el precio del servicio por el porcentaje de comisión.',
        },
        {
          formulaName: 'Total a Pagar por Colaborador',
          formulaCode: '=SUMIF(B2:B100, "NombreColaborador", H2:H100)',
          explanation: 'Suma todas las comisiones ganadas por un especialista específico en el rango.',
        },
        {
          formulaName: 'Detección de Clientes Inactivos (>30 días)',
          formulaCode: '=IF(TODAY() - F2 > 30, "🔴 Inactivo (Reactivar)", "🟢 Al Día")',
          explanation: 'Marca automáticamente en color rojo a los clientes que llevan más de 30 días sin visitarte.',
        },
      ],
    },
    freeToolsRecommended: [
      { toolName: 'Google Sheets', url: 'https://sheets.google.com', howToUse: 'Base de datos central, fórmulas financieras y cálculo de comisiones.', cost: '100% Gratis' },
      { toolName: 'Google Forms', url: 'https://forms.google.com', howToUse: 'Formulario web para registro de clientes y fichas técnicas desde celular o tablet.', cost: '100% Gratis' },
      { toolName: 'WhatsApp Business', url: 'https://whatsapp.com/business', howToUse: 'Respuestas rápidas para las plantillas, catálogo de servicios y etiquetas de clientes.', cost: '100% Gratis' },
      { toolName: 'Notion (Plan Free)', url: 'https://notion.so', howToUse: 'Alternativa visual moderna con vistas de galería, fichas con fotos de antes/después.', cost: '100% Gratis' },
      { toolName: 'AppSheet (Free Development)', url: 'https://appsheet.com', howToUse: 'Convierte tu Google Sheet en una app móvil nativa para ti y tu equipo sin programar.', cost: '100% Gratis' },
    ],
  };
}

async function startServer() {
  // In development, integrate Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRM Master Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
