import React from 'react';
import { Droplet, AlertTriangle, ShieldCheck, Zap, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { AVAILABLE_PACKAGES } from '../utils/pricing';

interface ServicesShowcaseProps {
  onStartBooking: () => void;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({ onStartBooking }) => {
  return (
    <div className="space-y-16 py-6">
      {/* Tap Water Warning vs Pure DM Water Education */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Critical Solar Science
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Tap Water & Domestic Wipers Ruin Solar Panels
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Most homeowners use groundwater, tap water, or household wipers, unaware of the irreversible chemical and optical degradation.
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tap Water (The Wrong Way) */}
          <div className="bg-red-50/60 p-6 sm:p-7 rounded-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-base">
              <XCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>Unfiltered Tap Water & Domestic Clean</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Calcium & Salt Scaling:</strong> High TDS tap water leaves white mineral deposits that bake under 60°C sunlight, creating permanent cloudy film.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Thermal Shock Micro-Cracks:</strong> Spraying cold tap water onto scorching hot midday panels induces thermal stress and cell micro-cracks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Abrasive Glass Scratches:</strong> Household brooms or wipers drag sharp silica dust across anti-reflective glass, permanently lowering light intake.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Electrical & Safety Hazard:</strong> Untrained staff lack 1000V DC insulated safety footwear and rooftop fall-arrest safety harnesses.
                </span>
              </li>
            </ul>
          </div>

          {/* Qubits Solar Pure DM Water (The Right Way) */}
          <div className="bg-emerald-50/60 p-6 sm:p-7 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Qubits Solar Certified Pure DM Clean</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">&lt;10 PPM De-Mineralized Water:</strong> 100% ion-exchanged pure water acts as a natural solvent, lifting dirt and evaporating without water spots.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Optimal Thermal Scheduling:</strong> Wash performed during early morning or sunset cool windows, protecting fragile silicon wafers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Solar-Grade Rotary Brushes:</strong> Flagged-nylon split bristles gently dislodge baked bird droppings without micro-scratching AR coating.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-black mt-0.5">•</span>
                <span>
                  <strong className="text-slate-900">Certified Rigging & Inverter Audit:</strong> Certified safety crew equipped with PPE, fall-arrest anchors, and post-clean MPPT log verification.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Service Packages Breakdown */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
            Tailored Clean Technologies
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Our Cleaning Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(AVAILABLE_PACKAGES).map(([key, pkg]) => (
            <div
              key={key}
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-sm ${
                pkg.recommended
                  ? 'border-blue-600 ring-2 ring-blue-500/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {pkg.recommended && (
                  <span className="text-[11px] bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full inline-block shadow-xs">
                    RECOMMENDED CHOICE
                  </span>
                )}
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">{pkg.name}</h3>
                  <div className="text-xs text-orange-600 font-bold mt-0.5">{pkg.tagline}</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-800">Key Features:</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {pkg.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={onStartBooking}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  pkg.recommended
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800'
                }`}
              >
                <span>Select in Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
