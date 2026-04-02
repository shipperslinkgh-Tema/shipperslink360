export interface VinDecodedVehicle {
  vin: string;
  make: string;
  model: string;
  modelYear: number;
  displacementL: string;
  fuelType: string;
  transmissionStyle: string;
  driveType: string;
  bodyClass: string;
  vehicleType: string;
}

export interface DutyCalculation {
  cif_usd: number;
  exchange_rate: number;
  cif_ghs: number;
  import_duty: number;
  vat: number;
  nhil_getfund: number;
  statutory_charges: number;
  age_penalty: number;
  total_duty: number;
  negotiable_min: number;
  negotiable_max: number;
  vehicle_age: number;
  is_over_10_years: boolean;
}

export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export function validateVin(vin: string): boolean {
  return VIN_REGEX.test(vin.toUpperCase());
}

export function calculateDuty(
  cif_usd: number,
  exchange_rate: number,
  modelYear: number
): DutyCalculation {
  const currentYear = new Date().getFullYear();
  const vehicle_age = currentYear - modelYear;
  const is_over_10_years = vehicle_age > 10;

  const cif_ghs = cif_usd * exchange_rate;
  const import_duty = cif_ghs * 0.20;
  const vat = (cif_ghs + import_duty) * (0.15 / 1.15);
  const nhil_getfund = cif_ghs * 0.05;

  // Statutory charges scaled to CIF
  let statutory_charges: number;
  if (cif_ghs <= 5000) statutory_charges = 100;
  else if (cif_ghs <= 20000) statutory_charges = 250;
  else if (cif_ghs <= 50000) statutory_charges = 500;
  else if (cif_ghs <= 100000) statutory_charges = 1000;
  else statutory_charges = 2000;

  // Age penalty for vehicles over 10 years
  let age_penalty = 0;
  if (is_over_10_years) {
    const extra_years = vehicle_age - 10;
    age_penalty = cif_ghs * 0.05 * Math.min(extra_years, 5);
  }

  const total_duty = import_duty + vat + nhil_getfund + statutory_charges + age_penalty;
  const negotiable_min = total_duty * 0.565;
  const negotiable_max = total_duty * 0.758;

  return {
    cif_usd,
    exchange_rate,
    cif_ghs,
    import_duty,
    vat,
    nhil_getfund,
    statutory_charges,
    age_penalty,
    total_duty,
    negotiable_min,
    negotiable_max,
    vehicle_age,
    is_over_10_years,
  };
}

export const fmt = (val: number) =>
  new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
