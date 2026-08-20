export type BusinessType =
  | 'barberia'
  | 'clinica_belleza'
  | 'estilista_independiente'
  | 'clinica_dental'
  | 'spa_masajes'
  | 'unas_pestanas'
  | 'otro';

export type TeamScheme = 'independiente' | 'pequeno_1_3' | 'mediano_4_10' | 'grande_10_mas';

export type PaymentScheme = 'comision' | 'renta_espacio' | 'sueldo_fijo' | 'mixto';

export interface BusinessFormData {
  businessType: BusinessType;
  customBusinessType?: string;
  businessName: string;
  city: string;
  country: string;
  currency: string;
  currencySymbol: string;
  whatsapp: string;
  phone: string;
  address: string;
  teamScheme: TeamScheme;
  collaboratorsCount: number;
  paymentScheme: PaymentScheme;
  commissionPercentage: number;
  spaceRentCost?: string;
  services: string;
  notes?: string;
}

export interface CRMField {
  name: string;
  type: 'Texto' | 'Número' | 'Fecha' | 'Selector / Opciones' | 'Fórmula' | 'Booleano / Casilla' | 'Teléfono / Link';
  category: 'Datos Generales' | 'Especialidad / Historial Técnico' | 'Preferencias & Hábitos' | 'Financiero & Fidelización';
  example: string;
  purpose: string;
  options?: string[];
  isRequired: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  scenario: 'confirmacion' | 'recordatorio' | 'reactivacion' | 'cumpleanos' | 'post_servicio' | 'personalizado';
  templateText: string;
  variables: string[];
  recommendedTiming: string;
  category: 'Citas' | 'Seguimiento' | 'Fidelización';
}

export interface EmployeeModule {
  enabled: boolean;
  modelType: string;
  dailyClosingColumns: {
    columnName: string;
    description: string;
    formula?: string;
    exampleValue: string;
  }[];
  paymentRules: string[];
  sampleClosingRows: Array<{
    colaborador: string;
    servicio: string;
    monto: string;
    metodoPago: string;
    comisionCalculada: string;
  }>;
  tipsAndRules: string[];
}

export interface StepByStepGuide {
  platform: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    actionableTip: string;
  }[];
  quickSetupChecklist: string[];
  googleSheetsFormulaHelpers: {
    formulaName: string;
    formulaCode: string;
    explanation: string;
  }[];
}

export interface GeneratedCRMSystem {
  businessSummary: {
    name: string;
    typeLabel: string;
    location: string;
    currency: string;
    recommendation: string;
  };
  fichaCliente: {
    title: string;
    description: string;
    fields: CRMField[];
    note: string;
    sampleClientData: Record<string, string>;
  };
  plantillasMensajes: WhatsAppTemplate[];
  moduloColaboradores: EmployeeModule;
  guiaPasoAPaso: StepByStepGuide;
  freeToolsRecommended: {
    toolName: string;
    url: string;
    howToUse: string;
    cost: '100% Gratis';
  }[];
}

export interface ClientRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
  data: Record<string, any>;
}

export interface SaleRecord {
  id: string;
  fecha: string;
  colaborador: string;
  cliente: string;
  servicio: string;
  precioCobrado: number;
  metodoPago: string;
  comisionPorcentaje: number;
  comisionCalculada: number;
  gananciaNeta: number;
  notas?: string;
  createdAt: string;
}

export interface StoredBusinessProfile {
  id: string;
  name: string;
  businessType: string;
  city: string;
  country: string;
  currency: string;
  currencySymbol: string;
  createdAt: string;
  formData: BusinessFormData;
  crmSystem: GeneratedCRMSystem;
  chatHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  updatedCRM?: GeneratedCRMSystem;
}
