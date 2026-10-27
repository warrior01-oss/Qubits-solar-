import React from 'react';
import { IndianRupee, CheckCircle2, Sparkles, MessageSquare, Phone, ArrowRight } from 'lucide-react';
import { COMPANY_DETAILS, FREQUENCY_PLANS, SERVICE_ADDONS, getWhatsAppUrl } from '../utils/pricing';

interface PricingTableProps {
  onStartBooking: () => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onStartBooking }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          Transparent Cost Structure
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Simple Per-Panel & Annual AMC Pricing
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Zero hidden charges. All prices include high-purity de-mineralized water, carbon-fiber telescopic rigging, and post-clean generation checks.
        </p>
      </div>

      {/* Tiered Panel Rate Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-orange-500" />
          <span>Volume-Based Per-Panel Rates</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { range: '1 - 20 Panels', rate: '₹25', sub: 'Min visit ₹499', label: 'Residential (3-8 kW)' },
            { range: '21 - 50 Panels', rate: '₹20', sub: 'Save 20%', label: 'Villa / Large Home' },
            { range: '51 - 150 Panels', rate: '₹16', sub: 'Save 36%', label: 'Society / Commercial' },
            { range: '151 - 500 Panels', rate: '₹13', sub: 'Save 48%', label: 'Industrial Sheds' },
            { range: '500+ Panels', rate: '₹10', sub: 'Bulk Enterprise', label: 'MW Scale Solar Farms' },
          ].map((tier, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
            >
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">{tier.range}</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{tier.rate}</div>
                <div className="text-[10px] text-orange-600 font-extrabold">{tier.sub}</div>
              </div>
              <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 font-medium">
                {tier.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AMC Annual Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 text-center">
          Annual Maintenance Contracts (AMC)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(FREQUENCY_PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white border rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                plan.discountPercent === 25
                  ? 'border-orange-500 ring-2 ring-orange-500/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                {plan.discountPercent === 25 && (
                  <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full inline-block">
                    BEST VALUE FOR RESIDENTIAL
                  </span>
                )}
                <div className="font-extrabold text-base text-slate-900">{plan.label}</div>
                <p className="text-xs text-slate-500">{plan.description}</p>
                {plan.discountPercent > 0 ? (
                  <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
                    {plan.discountPercent}% OFF Standard Rate
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-500">Standard On-Demand Clean</div>
                )}
              </div>

              <button
                type="button"
                onClick={onStartBooking}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  plan.discountPercent === 25
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800'
                }`}
              >
                Choose {plan.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Addons List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Optional Specialized Add-On Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SERVICE_ADDONS.map((addon) => (
            <div key={addon.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{addon.name}</span>
                <span className="font-extrabold text-xs text-blue-700">+₹{addon.price}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{addon.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Custom Quote & WhatsApp CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Commercial & Society Bulk Plans</span>
          <h4 className="text-xl sm:text-2xl font-black">Need a Customized Cleaning AMC Quote?</h4>
          <p className="text-xs text-blue-200 max-w-xl">
            Have a residential society, commercial factory, or solar farm over 25 kW? Contact our field coordinators directly for bulk volumetric discounts.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartBooking}
            className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Book Online Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href={getWhatsAppUrl('Hello Qubits Solar, I need an AMC quote for our solar plant.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp: {COMPANY_DETAILS.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
