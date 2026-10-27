import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePanelFromKw,
  calculateKwFromPanels,
  getBasePricePerPanel,
  calculatePricingQuote,
  calculateSoilingLoss,
} from './pricing';

test('converts kW to panel count correctly', () => {
  // 400W panels = 2.5 panels/kW
  assert.equal(calculatePanelFromKw(10), 25);
  assert.equal(calculatePanelFromKw(5), 13); // round(12.5) -> 13
  assert.equal(calculatePanelFromKw(1), 3); // round(2.5) -> 3
  assert.equal(calculatePanelFromKw(0), 1);
});

test('converts panel count to kW capacity correctly', () => {
  assert.equal(calculateKwFromPanels(10), 4.0);
  assert.equal(calculateKwFromPanels(25), 10.0);
  assert.equal(calculateKwFromPanels(50), 20.0);
});

test('base rate tiers apply volume discounts', () => {
  assert.equal(getBasePricePerPanel(10), 25);
  assert.equal(getBasePricePerPanel(20), 25);
  assert.equal(getBasePricePerPanel(30), 20);
  assert.equal(getBasePricePerPanel(100), 16);
  assert.equal(getBasePricePerPanel(300), 13);
  assert.equal(getBasePricePerPanel(1000), 10);
});

test('minimum visit charge of 499 applies for very small installations', () => {
  const quote = calculatePricingQuote({
    panelCount: 4, // 4 * 25 = 100, which is below min 499
    packageId: 'standard_dm',
    frequency: 'one_time',
    roofType: 'flat_concrete',
    selectedAddonIds: [],
    waterAvailability: 'rooftop_tap',
  });

  assert.equal(quote.minimumChargeApplied, true);
  // Base 499 * 1.0 (package) * 1.0 (roof) = 499
  // 18% GST on 499 = 90
  // Total = 589
  assert.equal(quote.packageSubtotal, 499);
  assert.equal(quote.frequencyDiscountAmount, 0);
  assert.equal(quote.totalPerVisit, 589);
});

test('frequency discounts reduce price accurately', () => {
  const oneTime = calculatePricingQuote({
    panelCount: 50,
    packageId: 'standard_dm',
    frequency: 'one_time',
    roofType: 'flat_concrete',
    selectedAddonIds: [],
    waterAvailability: 'rooftop_tap',
  });

  const quarterly = calculatePricingQuote({
    panelCount: 50,
    packageId: 'standard_dm',
    frequency: 'quarterly', // 15% off
    roofType: 'flat_concrete',
    selectedAddonIds: [],
    waterAvailability: 'rooftop_tap',
  });

  const biMonthly = calculatePricingQuote({
    panelCount: 50,
    packageId: 'standard_dm',
    frequency: 'bi_monthly', // 20% off
    roofType: 'flat_concrete',
    selectedAddonIds: [],
    waterAvailability: 'rooftop_tap',
  });

  assert.equal(quarterly.frequencyDiscountPercent, 15);
  assert.equal(biMonthly.frequencyDiscountPercent, 20);
  assert.ok(quarterly.totalPerVisit < oneTime.totalPerVisit);
  assert.ok(biMonthly.totalPerVisit < quarterly.totalPerVisit);
});

test('addons and water tanker fee add to quote', () => {
  const withAddons = calculatePricingQuote({
    panelCount: 20,
    packageId: 'standard_dm',
    frequency: 'one_time',
    roofType: 'flat_concrete',
    selectedAddonIds: ['thermal_ir_scan', 'inverter_health_check'],
    waterAvailability: 'tanker_required', // + 450
  });

  // thermal 799 + inverter 599 + tanker 450 = 1848
  assert.equal(withAddons.addonTotal, 799 + 599 + 450);
});

test('soiling loss calculation reflects dust and days since clean', () => {
  const fresh = calculateSoilingLoss(10, 5, 'low');
  const dirty = calculateSoilingLoss(10, 60, 'heavy');

  assert.ok(dirty.currentLossPercent > fresh.currentLossPercent);
  assert.ok(dirty.monthlyLossInr > fresh.monthlyLossInr);
  assert.ok(dirty.paybackPeriodDays > 0);
});
