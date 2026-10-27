export type PropertyType = 
  | 'residential_rooftop' 
  | 'residential_villa' 
  | 'commercial_industrial' 
  | 'housing_society' 
  | 'agricultural_solar_farm';

export type RoofType = 
  | 'flat_concrete' 
  | 'tin_metal_shed' 
  | 'elevated_structure' 
  | 'ground_mounted';

export type CleaningPackageId = 
  | 'standard_dm' 
  | 'hydrophobic_nano' 
  | 'waterless_dry';

export type ServiceFrequency = 
  | 'one_time' 
  | 'quarterly' 
  | 'bi_monthly' 
  | 'monthly';

export interface ServiceAddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  perPanel?: boolean;
}

export type WaterAvailability = 
  | 'rooftop_tap' 
  | 'ground_tap' 
  | 'tanker_required' 
  | 'client_borewell';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
  accessNotes?: string;
}

export interface QuotePricing {
  panelCount: number;
  systemCapacityKw: number;
  baseRatePerPanel: number;
  ratePerPanel?: number;
  rawBaseTotal: number;
  minimumChargeApplied: boolean;
  packageMultiplier: number;
  packageSubtotal: number;
  frequencyDiscountPercent: number;
  frequencyDiscountAmount: number;
  frequencyVisitsPerYear: number;
  addonTotal: number;
  taxAmount: number;
  totalPerVisit: number;
  finalPrice?: number;
  discountedPrice?: number;
  annualEstimate: number;
  estimatedUnitsRecoveredMonthly: number;
  estimatedMonthlySavingsInr: number;
}

export type BookingStatus = 
  | 'confirmed' 
  | 'technician_assigned' 
  | 'in_progress' 
  | 'completed' 
  | 'rescheduled' 
  | 'cancelled';

export interface Booking {
  id: string;
  createdAt: string;
  status: BookingStatus;
  propertyType: PropertyType;
  roofType: RoofType;
  panelCount: number;
  systemCapacityKw: number;
  packageId: CleaningPackageId;
  frequency: ServiceFrequency;
  selectedAddonIds: string[];
  waterAvailability: WaterAvailability;
  scheduledDate: string;
  timeSlot: string;
  customer: CustomerDetails;
  pricing: QuotePricing;
  assignedTechnician?: {
    name: string;
    phone: string;
    rating: number;
    teamLead: string;
  };
}
