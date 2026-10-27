import React, { useState } from 'react';
import { Sun, ShieldCheck, Zap, Droplet, ArrowRight, Phone, MessageSquare, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { COMPANY_DETAILS, calculateSolarCleaningQuote } from '../utils/pricing';
import { PWAInstallButton } from './PWAInstallButton';

interface HeroSectionProps {
  onStartBooking: () => void;
  onOpenCalculator: () => void;
  onSelectCapacity?: (kw: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartBooking,
  onOpenCalculator,
  onSelectCapacity,
}) => {
  const [quickKw, setQuickKw] = useState<number>(5);

  const quickQuote = calculateSolarCleaningQuote({
    panelCount: Math.max(1, Math.round(quickKw * 2.5)),
    roofType: 'flat_concrete',
    waterAvailability: 'rooftop_tap',
    packageId: 'standard_dm',
    frequency: 'one_time',
    selectedAddonIds: [],
  });

  const handleQuickBook = (kw: number) => {
    if (onSelectCapacity) {
      onSelectCapacity(kw);
    }
    onStartBooking();
  };

  return (
    <div className="relative overflow-hidden pt-8 sm:pt-12 pb-14 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200">
      {/* Background Soft Solar Radiance */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 -z-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Hero Copy - Light & High Trust */}
          <div className="lg:col-span-7 space-y-6">
            {/* Subsidiary & Trust Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 text-xs text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-extrabold text-blue-900">{COMPANY_DETAILS.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">{COMPANY_DETAILS.subsidiaryText}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Restore Up To{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
                30% Lost Solar Power
              </span>{' '}
              With Pure DM Water.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Hard tap water causes permanent calcium scaling and hotspot micro-cracks. <strong className="text-slate-900 font-semibold">Qubits Solar</strong> uses laboratory-grade zero-mineral de-ionized water, rotating soft-filament brushes, and certified fall-protection rigging for residential villas, housing societies, and industrial solar plants.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStartBooking}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm transition-all shadow-md shadow-orange-500/25 active:scale-95"
              >
                <span>Book Cleaning in 60s</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenCalculator}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-800 border border-slate-300 font-bold text-sm transition-all shadow-xs"
              >
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Calculate Yield Loss</span>
              </button>

              <PWAInstallButton variant="hero" />

              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="hidden sm:flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span>{COMPANY_DETAILS.phoneDisplay}</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 text-blue-700">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">&lt;10 PPM Pure DM Water</div>
                  <div className="text-[11px] text-slate-500">Zero white calcium scale</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Insured Rigging Crew</div>
                  <div className="text-[11px] text-slate-500">Lifelines & 1000V DC safety</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center shrink-0 mt-0.5 text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Instant WhatsApp Booking</div>
                  <div className="text-[11px] text-slate-500">Dedicated dispatch coordinator</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Easy Booking Estimator Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-lg shadow-blue-500/5 space-y-6">
              {/* Card Header with Logo */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 bg-white shadow-xs">
                    <img
                      src={COMPANY_DETAILS.logoSolar}
                      alt="Qubits Solar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">Quick Estimate & Booking</div>
                    <div className="text-[11px] text-slate-500">Choose capacity & book your slot</div>
                  </div>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Team
                </span>
              </div>

              {/* Quick Capacity Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Solar System Capacity:</span>
                  <span className="text-blue-700 font-extrabold">{quickKw} kW ({quickQuote.panelCount} Panels)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 10, 20].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setQuickKw(kw)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-extrabold border transition-all ${
                        quickKw === kw
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {kw} kW
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Quote Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-orange-50/50 border border-blue-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-600">Pure DM Water Clean Price:</span>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{quickQuote.discountedPrice}
                      <span className="text-xs font-normal text-slate-500 ml-1">/ visit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      +15% to 25% Surge
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">₹{quickQuote.ratePerPanel}/panel</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/70 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>TDS-tested &lt;10 PPM pure de-ionized water</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Non-abrasive microfiber scrubbers (zero scratching)</span>
                  </div>
                </div>
              </div>

              {/* Direct Booking Action */}
              <button
                type="button"
                onClick={() => handleQuickBook(quickKw)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                <span>Book This {quickKw} kW Slot Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct phone / assistance */}
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Direct help:</span>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <a href={`tel:${COMPANY_DETAILS.phone}`} className="hover:text-orange-600 transition-colors">
                    {COMPANY_DETAILS.phone}
                  </a>
                  <span>·</span>
                  <a href={`tel:${COMPANY_DETAILS.altPhone}`} className="hover:text-blue-700 transition-colors">
                    {COMPANY_DETAILS.altPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
