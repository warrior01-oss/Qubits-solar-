import {
  CleaningPackageId,
  PropertyType,
  QuotePricing,
  RoofType,
  ServiceAddonItem,
  ServiceFrequency,
  WaterAvailability,
} from '../types/solar';

export const COMPANY_DETAILS = {
  name: 'Qubits Solar',
  parentCompany: 'Qubits Consultancy',
  subsidiaryText: 'A subsidiary under Qubits Consultancy',
  phone: '9250707712',
  phoneDisplay: '+91 9250707712',
  altPhone: '8303036018',
  alternatePhone: '8303036018',
  altPhoneDisplay: '+91 8303036018',
  email: 'team@qubitsconsultancy.in',
  solarWebsite: 'Qubitssolar.page.gd',
  solarWebsiteUrl: 'https://qubitssolar.page.gd',
  website: 'qubitsconsultancy.in',
  websiteUrl: 'https://qubitsconsultancy.in',
  parentWebsite: 'qubitsconsultancy.in',
  parentWebsiteUrl: 'https://qubitsconsultancy.in',
  hours: 'Monday – Sunday: 7:00 AM – 7:00 PM',
  logoSolar: '/assets/aistudio/IMG-20260920-WA0009_bc02a149.jpg',
  logoConsultancy: '/assets/aistudio/_9F00FF_9e509ae2.png',
};

/**
 * Universally compatible WhatsApp URL generator.
 * Uses direct api.whatsapp.com/send to prevent 302 redirect failures in webviews, iframes, and mobile browsers.
 */
export function getWhatsAppUrl(text: string, phone: string = COMPANY_DETAILS.phone): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`;
}

export const AVAILABLE_PACKAGES: Record<
  CleaningPackageId,
  {
    id: CleaningPackageId;
    name: string;
    tagline: string;
    description: string;
    multiplier: number;
    benefits: string[];
    recommended?: boolean;
  }
> = {
  standard_dm: {
    id: 'standard_dm',
    name: 'Pure DM De-Ionized Wash',
    tagline: 'Zero-Residue Mineral-Free Scrub',
    description: 'High-purity de-ionized water scrub with soft-filament rotary brushes. Dissolves bird droppings, soot, and industrial dust without leaving calcium scaling.',
    multiplier: 1.0,
    benefits: [
      '< 10 PPM Demineralized Water (0% Hard Water Stains)',
      'Solar-grade non-scratch microfiber scrubbers',
      'Immediate 15%–25% generation surge',
      'Post-clean inverter generation log check',
    ],
    recommended: true,
  },
  hydrophobic_nano: {
    id: 'hydrophobic_nano',
    name: 'Hydrophobic Nano-Shield Wash',
    tagline: 'Deep Clean + 60-Day Anti-Dust Coating',
    description: 'Standard pure DM cleaning followed by a certified hydrophobic optical nano-layer that repels dust, pollution, and water stains for up to 60 days.',
    multiplier: 1.45,
    benefits: [
      'Includes everything in Pure DM Wash',
      'Anti-static & hydrophobic lotus-effect coating',
      'Reduces dirt accumulation by 65% for 2 months',
      'Rainfall automatically self-cleans light dust',
      'Enhanced UV & bird drop resistance',
    ],
  },
  waterless_dry: {
    id: 'waterless_dry',
    name: 'Waterless Microfiber Dry Polish',
    tagline: 'Dry Sweep For Water-Restricted Sites',
    description: 'Specialized electrostatic microfiber sweeper and air-blower treatment designed for remote sites or emergency dry weather cleans.',
    multiplier: 0.9,
    benefits: [
      'Zero water consumption',
      'Electrostatic dust attraction',
      'Safe for sites without rooftop water access',
      'Suitable for quick weekly touch-ups',
    ],
  },
};

export const FREQUENCY_PLANS: Record<
  ServiceFrequency,
  {
    id: ServiceFrequency;
    label: string;
    visitsPerYear: number;
    discountPercent: number;
    badge?: string;
    description: string;
  }
> = {
  one_time: {
    id: 'one_time',
    label: 'One-Time Deep Clean',
    visitsPerYear: 1,
    discountPercent: 0,
    description: 'Perfect for seasonal restoration or pre-audit cleaning.',
  },
  quarterly: {
    id: 'quarterly',
    label: 'Quarterly Maintenance (4 visits/yr)',
    visitsPerYear: 4,
    discountPercent: 15,
    badge: 'Popular for Homes',
    description: 'Quarterly schedule ensures peak summer & post-monsoon generation.',
  },
  bi_monthly: {
    id: 'bi_monthly',
    label: 'Bi-Monthly AMC (6 visits/yr)',
    visitsPerYear: 6,
    discountPercent: 20,
    badge: 'Save 20%',
    description: 'Ideal balance for urban rooftop environments prone to dust & pollution.',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly Professional AMC (12 visits/yr)',
    visitsPerYear: 12,
    discountPercent: 30,
    badge: 'Best Value (Save 30%)',
    description: 'Maximum generation protection for commercial plants, societies & high-dust zones.',
  },
};

export const SERVICE_ADDONS: ServiceAddonItem[] = [
  {
    id: 'thermal_ir_scan',
    name: 'Thermal Drone / IR Hotspot Inspection',
    description: 'Detect hidden cell hotspots, defective bypass diodes, and micro-cracks before they cause fire hazards or permanent panel degradation.',
    price: 799,
  },
  {
    id: 'inverter_health_check',
    name: 'Inverter Diagnostics & Earth Leakage Test',
    description: 'Comprehensive voltage, MPPT string balance, earthing resistance, and DC isolator safety audit.',
    price: 599,
  },
  {
    id: 'bird_mesh_guard',
    name: 'Anti-Pigeon Bird Netting (Per 10 Panels)',
    description: 'UV-resistant polycarbonate mesh prevents birds from nesting under panels, reducing fire risk and foul droppings.',
    price: 850,
  },
  {
    id: 'cable_dressing',
    name: 'DC Cable Dressing & Terminal Retorquing',
    description: 'Secure sagging wires from rooftop heat and water pooling; retorque loose DC connections.',
    price: 450,
  },
];

export const PROPERTY_OPTIONS: Record<
  PropertyType,
  { label: string; iconName: string; defaultPanels: number; desc: string }
> = {
  residential_rooftop: {
    label: 'Residential Rooftop',
    iconName: 'Home',
    defaultPanels: 10,
    desc: '3kW - 10kW residential grid-tied setups',
  },
  residential_villa: {
    label: 'Independent Villa / Bungalow',
    iconName: 'Building',
    defaultPanels: 25,
    desc: '10kW - 25kW high-yield installations',
  },
  housing_society: {
    label: 'Housing Society / Common Area',
    iconName: 'Building2',
    defaultPanels: 80,
    desc: '25kW - 100kW+ common lighting & pump systems',
  },
  commercial_industrial: {
    label: 'Commercial & Industrial Factory',
    iconName: 'Factory',
    defaultPanels: 250,
    desc: '50kW - 500kW+ factory sheds & office roofs',
  },
  agricultural_solar_farm: {
    label: 'Agricultural / Ground Solar Farm',
    iconName: 'Sun',
    defaultPanels: 600,
    desc: 'Ground mounted & agro-photovoltaic fields',
  },
};

export const ROOF_OPTIONS: Record<
  RoofType,
  { label: string; riskModifier: number; desc: string }
> = {
  flat_concrete: {
    label: 'Flat Concrete Rooftop',
    riskModifier: 1.0,
    desc: 'Easy staircase or roof hatch access with parapet wall',
  },
  tin_metal_shed: {
    label: 'Slanted Tin / Industrial Shed',
    riskModifier: 1.15,
    desc: 'Requires lifeline harnesses and fall-arrest safety anchors',
  },
  elevated_structure: {
    label: 'Elevated Gazebo / Pergola Structure (>10ft)',
    riskModifier: 1.1,
    desc: 'High-rise structure requiring scaffolding or telescoping rods',
  },
  ground_mounted: {
    label: 'Ground Mounted Array',
    riskModifier: 0.95,
    desc: 'Direct ground access, minimal climbing required',
  },
};

export const WATER_OPTIONS: Record<
  WaterAvailability,
  { label: string; fee: number; desc: string }
> = {
  rooftop_tap: {
    label: 'Direct Water Tap on Rooftop',
    fee: 0,
    desc: 'Convenient water source readily available on the roof',
  },
  ground_tap: {
    label: 'Ground Floor Tap (We bring pressure hose)',
    fee: 0,
    desc: 'Ground water point available, our crew brings long 50m delivery pipes',
  },
  client_borewell: {
    label: 'Client Borewell / Softener Connection',
    fee: 0,
    desc: 'High pressure motor or soft water outlet available on premises',
  },
  tanker_required: {
    label: 'No Water on Site (Qubits Water Tanker)',
    fee: 450,
    desc: 'We supply pre-filtered de-mineralized water tanker to site',
  },
};

/**
 * Approximate panels from capacity in kW (assuming modern 400W panels = 2.5 panels per kW)
 */
export function calculatePanelFromKw(kw: number): number {
  if (kw <= 0) return 1;
  return Math.max(1, Math.round(kw * 2.5));
}

/**
 * Approximate system capacity in kW from panel count
 */
export function calculateKwFromPanels(panels: number): number {
  if (panels <= 0) return 0.4;
  return Number(((panels * 400) / 1000).toFixed(1));
}

/**
 * Tiered base price per panel (in INR)
 */
export function getBasePricePerPanel(panelCount: number): number {
  if (panelCount <= 20) return 25;
  if (panelCount <= 50) return 20;
  if (panelCount <= 150) return 16;
  if (panelCount <= 500) return 13;
  return 10;
}

export interface CalculateQuoteInput {
  panelCount: number;
  packageId: CleaningPackageId;
  frequency: ServiceFrequency;
  roofType: RoofType;
  selectedAddonIds: string[];
  waterAvailability: WaterAvailability;
}

export function calculatePricingQuote(input: CalculateQuoteInput): QuotePricing {
  const panelCount = Math.max(1, Math.round(input.panelCount || 1));
  const systemCapacityKw = calculateKwFromPanels(panelCount);
  const baseRatePerPanel = getBasePricePerPanel(panelCount);
  
  // Base cost before minimum visit thresholds
  const rawCalculated = panelCount * baseRatePerPanel;
  const MINIMUM_VISIT_CHARGE = 499;
  const minimumChargeApplied = rawCalculated < MINIMUM_VISIT_CHARGE;
  const baseAmount = Math.max(MINIMUM_VISIT_CHARGE, rawCalculated);

  // Roof factor
  const roofFactor = ROOF_OPTIONS[input.roofType]?.riskModifier || 1.0;

  // Package multiplier
  const packageDef = AVAILABLE_PACKAGES[input.packageId] || AVAILABLE_PACKAGES.standard_dm;
  const packageMultiplier = packageDef.multiplier;

  // Adjusted clean cost per visit
  const packageSubtotal = Math.round(baseAmount * roofFactor * packageMultiplier);

  // Frequency Plan discount
  const frequencyPlan = FREQUENCY_PLANS[input.frequency] || FREQUENCY_PLANS.one_time;
  const frequencyDiscountPercent = frequencyPlan.discountPercent;
  const frequencyDiscountAmount = Math.round((packageSubtotal * frequencyDiscountPercent) / 100);
  const discountedCleanCost = packageSubtotal - frequencyDiscountAmount;

  // Add-ons total
  let addonTotal = 0;
  for (const addonId of input.selectedAddonIds) {
    const addon = SERVICE_ADDONS.find(a => a.id === addonId);
    if (addon) {
      if (addon.id === 'bird_mesh_guard') {
        const blocks = Math.max(1, Math.ceil(panelCount / 10));
        addonTotal += addon.price * blocks;
      } else {
        addonTotal += addon.price;
      }
    }
  }

  // Water logistics fee if tanker is requested
  const waterFee = WATER_OPTIONS[input.waterAvailability]?.fee || 0;
  addonTotal += waterFee;

  // Total per single visit
  const totalPerVisit = discountedCleanCost + addonTotal;

  // 18% GST (Standard green energy service GST)
  const taxAmount = Math.round(totalPerVisit * 0.18);
  const finalTotal = totalPerVisit + taxAmount;

  // Annual projection
  const annualEstimate = finalTotal * frequencyPlan.visitsPerYear;

  // Estimated Generation Recovery
  // 1 kW solar generates ~4 units (kWh) daily in India (~120 units/month)
  // Dirty panels lose 15-28% of generation
  const monthlyGenerationUnits = systemCapacityKw * 120;
  const recoveredUnitsMonthly = Math.round(monthlyGenerationUnits * 0.22); // average 22% recovery
  const AVERAGE_GRID_TARIFF = 7.5; // INR per kWh
  const estimatedMonthlySavingsInr = Math.round(recoveredUnitsMonthly * AVERAGE_GRID_TARIFF);

  return {
    panelCount,
    systemCapacityKw,
    baseRatePerPanel,
    ratePerPanel: baseRatePerPanel,
    rawBaseTotal: rawCalculated,
    minimumChargeApplied,
    packageMultiplier,
    packageSubtotal,
    frequencyDiscountPercent,
    frequencyDiscountAmount,
    frequencyVisitsPerYear: frequencyPlan.visitsPerYear,
    addonTotal,
    taxAmount,
    totalPerVisit: finalTotal,
    finalPrice: finalTotal,
    discountedPrice: finalTotal,
    annualEstimate,
    estimatedUnitsRecoveredMonthly: recoveredUnitsMonthly,
    estimatedMonthlySavingsInr,
  };
}

// Alias for convenience
export const calculateSolarCleaningQuote = calculatePricingQuote;

/**
 * Calculate detailed soiling losses for the interactive Solar Loss Calculator
 */
export function calculateSoilingLoss(
  capacityKw: number,
  daysSinceLastClean: number,
  dustSeverity: 'low' | 'moderate' | 'heavy' | 'industrial'
) {
  const dailyGenPerKw = 4.2; // kWh/day average in India
  const monthlyExpectedGen = capacityKw * dailyGenPerKw * 30; // kWh

  let dailyDegradationRate = 0.003; // 0.3% per day
  if (dustSeverity === 'low') dailyDegradationRate = 0.0018;
  if (dustSeverity === 'moderate') dailyDegradationRate = 0.0035;
  if (dustSeverity === 'heavy') dailyDegradationRate = 0.0055;
  if (dustSeverity === 'industrial') dailyDegradationRate = 0.008;

  // Cap max soiling loss at 45% (panels still capture diffuse light)
  const rawLossPercent = Math.min(45, daysSinceLastClean * dailyDegradationRate * 100);
  const currentLossPercent = Number(rawLossPercent.toFixed(1));

  const monthlyLostUnits = Math.round(monthlyExpectedGen * (currentLossPercent / 100));
  const tariffPerUnit = 7.8; // Average INR per unit (Tier 2/commercial mix)
  const monthlyLossInr = Math.round(monthlyLostUnits * tariffPerUnit);
  const annualProjectedLossInr = monthlyLossInr * 12;

  // Clean cost for this capacity
  const panels = calculatePanelFromKw(capacityKw);
  const estimate = calculatePricingQuote({
    panelCount: panels,
    packageId: 'standard_dm',
    frequency: 'quarterly',
    roofType: 'flat_concrete',
    selectedAddonIds: [],
    waterAvailability: 'rooftop_tap',
  });

  const costOfClean = estimate.totalPerVisit;
  const paybackPeriodDays = Math.max(3, Math.round((costOfClean / (monthlyLossInr / 30))));

  return {
    capacityKw,
    panels,
    daysSinceLastClean,
    currentLossPercent,
    monthlyExpectedGen: Math.round(monthlyExpectedGen),
    monthlyLostUnits,
    monthlyLossInr,
    annualProjectedLossInr,
    costOfClean,
    paybackPeriodDays,
  };
}
