export interface CustomerDocument {
  id: string;
  name: string;
  type: "registration" | "license" | "contract" | "invoice" | "other";
  uploadDate: string;
  expiryDate?: string;
  status: "valid" | "expired" | "pending";
  fileSize: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  companyName: string;
  tradeName?: string;
  registrationNumber: string;
  tinNumber: string;
  industry: string;
  companyType: "importer" | "exporter" | "both" | "freight_forwarder";
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website?: string;
  status: "active" | "inactive" | "suspended";
  creditLimit: number;
  outstandingBalance: number;
  totalShipments: number;
  contacts: CustomerContact[];
  documents: CustomerDocument[];
  createdAt: string;
  lastActivityDate: string;
}
