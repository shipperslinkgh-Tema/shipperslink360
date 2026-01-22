export interface Truck {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  type: "flatbed" | "container" | "tanker" | "lowbed";
  capacity: string;
  status: "available" | "on-trip" | "maintenance";
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "available" | "on-trip" | "off-duty";
}

export interface Trip {
  id: string;
  truckId: string;
  driverId: string;
  containerNumber: string;
  blNumber: string;
  customer: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string | null;
  containerReturnDate: string | null;
  containerReturnLocation: string;
  containerReturned: boolean;
  tripCost: number;
  driverPayment: number;
  fuelCost: number;
  status: "scheduled" | "in-transit" | "delivered" | "completed";
  notes?: string;
}
