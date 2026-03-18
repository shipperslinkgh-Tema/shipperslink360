export interface HsSuggestion {
  hs_code: string;
  description: string;
  duty_rate: number;
  confidence: string;
}

export type CargoType = "general" | "vehicle" | "consolidated_lcl" | "air_freight";

export interface DutyEstimate {
  hs_code: string;
  hs_description: string;
  duty_rate_percent: number;
  cif_value: number;
  import_duty: number;
  vat: number;
  nhil: number;
  getfund: number;
  ecowas_levy: number;
  au_levy: number;
  exim_levy: number;
  processing_fee: number;
  total_duties: number;
  total_landed_cost: number;
  currency: string;
  notes: string;
  ecowas_applicable?: boolean;
  recommendations?: string;
  misclassification_warning?: string;
}

export interface GhsConversion {
  exchange_rate: number;
  rate_source: string;
  from_currency: string;
  ghs_cif_value: number;
  ghs_import_duty: number;
  ghs_vat: number;
  ghs_nhil: number;
  ghs_getfund: number;
  ghs_ecowas_levy: number;
  ghs_au_levy: number;
  ghs_exim_levy: number;
  ghs_processing_fee: number;
  ghs_total_duties: number;
  ghs_total_landed_cost: number;
}

export interface DutyFormData {
  hs_code: string;
  goods_description: string;
  fob_value: string;
  freight_value: string;
  insurance_value: string;
  currency: string;
  country_of_origin: string;
  cargo_type: CargoType;
  engine_capacity: string;
}

export const CURRENCIES = ["USD", "EUR", "GBP", "GHS", "CNY"];

export const COMMON_ORIGINS = [
  "China", "United States", "United Kingdom", "Germany", "India",
  "Turkey", "Japan", "South Korea", "Nigeria", "Côte d'Ivoire",
  "Togo", "Burkina Faso", "South Africa", "Netherlands", "Italy",
  "France", "Brazil", "UAE", "Thailand", "Malaysia",
];

export const CARGO_TYPES: { value: CargoType; label: string; icon: string }[] = [
  { value: "general", label: "General Cargo", icon: "📦" },
  { value: "vehicle", label: "Vehicle", icon: "🚗" },
  { value: "consolidated_lcl", label: "Consolidated (LCL)", icon: "🏗️" },
  { value: "air_freight", label: "Air Freight", icon: "✈️" },
];

export const fmt = (val: number) =>
  new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
