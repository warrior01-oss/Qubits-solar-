import React, { useState } from 'react';
import {
  Calculator,
  AlertTriangle,
  Zap,
  IndianRupee,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { calculateSoilingLoss } from '../utils/pricing';
import { formatInr } from '../utils/storage';

interface SoilingLossCalculatorProps {
  onSelectForBooking: (capacityKw: number) => void;
}

export const SoilingLossCalculator: React.FC<SoilingLossCalculatorProps> = ({
  onSelectForBooking,
}) => {
  const [capacityKw, setCapacityKw] = useState<number>(5);
  const [daysSinceLastClean, setDaysSinceLastClean] = useState<number>(45);
  const [dustSeverity, setDustSeverity] = useState<'low' | 'moderate' | 'heavy' | 'industrial'>(
    'heavy'
  );

  const metrics = calculateSoilingLoss(capacityKw, daysSinceLastClean, dustSeverity);

  const severityOptions = [
    {
      id: 'low',
      title: 'Low Dust / Green Suburb',
      desc: 'Residential colony with tree cover & minimal traffic',
    },
    {
      id: 'moderate',
      title: 'Moderate City Dust',
      desc: 'Standard urban street with light traffic & dust',
    },
    {
      id: 'heavy',
      title: 'Heavy Urban Smog / Highway',
      desc: 'Metro pollution, proximity to arterial roads or metro lines',
    },
    {
      id: 'industrial',
      title: 'Industrial Zone / Construction',
      desc: 'Active construction sites, factories, quarry or diesel soot',
    },
  ] as const;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
      {/* Title */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Solar Yield & ROI Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Solar Soiling & Revenue Loss Estimator
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            In Indian metropolitan areas, dust, airborne soot, and bird deposits diminish solar generation by 15% to 35% in just 4–6 weeks. Calculate your hidden losses below.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
          <Zap className="w-5 h-5 text-orange-500" />
          <div>
            <div className="text-[11px] text-slate-600">Average Rooftop Recovery</div>
            <div className="text-sm font-extrabold text-blue-900">+20% to +30% Yield Surge</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Capacity Slider */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">
                Solar Plant Capacity
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
                <span className="text-base font-extrabold text-blue-700">{capacityKw}</span>
                <span className="text-xs text-slate-500 font-medium">kW</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 font-semibold">~{metrics.panels} panels</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={capacityKw}
              onChange={(e) => setCapacityKw(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => setCapacityKw(3)}
                className={`hover:text-blue-700 transition-colors ${capacityKw === 3 ? 'text-blue-700 font-bold' : ''}`}
              >
                3 kW (Home)
              </button>
              <button
                type="button"
                onClick={() => setCapacityKw(5)}
                className={`hover:text-blue-700 transition-colors ${capacityKw === 5 ? 'text-blue-700 font-bold' : ''}`}
              >
                5 kW (Standard)
              </button>
              <button
                type="button"
                onClick={() => setCapacityKw(10)}
                className={`hover:text-blue-700 transition-colors ${capacityKw === 10 ? 'text-blue-700 font-bold' : ''}`}
              >
                10 kW (Villa)
              </button>
              <button
                type="button"
                onClick={() => setCapacityKw(25)}
                className={`hover:text-blue-700 transition-colors ${capacityKw === 25 ? 'text-blue-700 font-bold' : ''}`}
              >
                25 kW (Society)
              </button>
            </div>
          </div>

          {/* Days Since Clean Slider */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">
                Days Since Last Cleaned
              </label>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-base font-extrabold text-slate-900">{daysSinceLastClean}</span>
                <span className="text-xs text-slate-500 font-medium">days</span>
              </div>
            </div>

            <input
              type="range"
              min="7"
              max="180"
              step="1"
              value={daysSinceLastClean}
              onChange={(e) => setDaysSinceLastClean(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => setDaysSinceLastClean(15)}
                className={`hover:text-blue-700 transition-colors ${daysSinceLastClean === 15 ? 'text-blue-700 font-bold' : ''}`}
              >
                15 days
              </button>
              <button
                type="button"
                onClick={() => setDaysSinceLastClean(30)}
                className={`hover:text-blue-700 transition-colors ${daysSinceLastClean === 30 ? 'text-blue-700 font-bold' : ''}`}
              >
                1 Month
              </button>
              <button
                type="button"
                onClick={() => setDaysSinceLastClean(60)}
                className={`hover:text-blue-700 transition-colors ${daysSinceLastClean === 60 ? 'text-blue-700 font-bold' : ''}`}
              >
                2 Months
              </button>
              <button
                type="button"
                onClick={() => setDaysSinceLastClean(90)}
                className={`hover:text-blue-700 transition-colors ${daysSinceLastClean === 90 ? 'text-blue-700 font-bold' : ''}`}
              >
                3+ Months
              </button>
            </div>
          </div>

          {/* Dust Severity Environment */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-800">
              Surrounding Environment & Air Pollution Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {severityOptions.map((opt) => {
                const isSelected = dustSeverity === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDustSeverity(opt.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{opt.title}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Impact & ROI Dashboard */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Visual Metrics Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Efficiency Loss Card */}
            <div className="bg-red-50/60 p-5 rounded-2xl border border-red-200 relative overflow-hidden">
              <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Current Soiling Loss</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-red-600 mt-2">
                -{metrics.currentLossPercent}%
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Yield drop due to dust coating
              </div>
              <div className="w-full bg-red-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, metrics.currentLossPercent * 2.2)}%` }}
                />
              </div>
            </div>

            {/* Monthly Money Lost */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 relative overflow-hidden">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Monthly Money Lost</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-700 mt-2">
                {formatInr(metrics.monthlyLossInr)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                ~{metrics.monthlyLostUnits} units (kWh)/mo wasted
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (metrics.monthlyLostUnits / metrics.monthlyExpectedGen) * 100 * 2)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Annual Cumulative Loss Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Expected Monthly Output (Clean):</span>
              <span className="font-bold text-slate-900">{metrics.monthlyExpectedGen} kWh / month</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Annual Projected Financial Loss (Uncleaned):</span>
              <span className="font-extrabold text-red-600 text-sm">
                -{formatInr(metrics.annualProjectedLossInr)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-3">
              <span className="text-slate-600">One-Time Qubits Solar Clean Cost:</span>
              <span className="font-bold text-slate-900">{formatInr(metrics.costOfClean)}</span>
            </div>

            <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Cleaning Payback Timeline:</span>
              </div>
              <span className="font-black text-emerald-900 text-sm">
                Pays for itself in {metrics.paybackPeriodDays} days!
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={() => onSelectForBooking(capacityKw)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-98"
          >
            <span>Book Qubits Solar Cleaning for {capacityKw} kW System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
