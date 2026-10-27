import React from 'react';
import { Phone, Mail, Globe, ExternalLink, Download, ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS } from '../utils/pricing';

interface FooterProps {
  onNavigate: (tab: 'book' | 'calculator' | 'bookings' | 'services' | 'pricing' | 'contact' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Subsidiary Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shadow-xs flex items-center justify-center">
                <img
                  src={COMPANY_DETAILS.logoSolar}
                  alt="Qubits Solar Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base block">Qubits Solar</span>
                <span className="text-[10px] text-slate-500 font-medium">Solar Cleaning Specialist</span>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Demineralized pure DM water washing, hydrophobic lotus protective coating, and certified rooftop solar cleaning services.
            </p>

            {/* Parent Consultancy Badge */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Parent Organization:</div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <img
                  src={COMPANY_DETAILS.logoConsultancy}
                  alt="Qubits Consultancy"
                  className="w-4 h-4 object-contain inline-block rounded-xs"
                />
                <span>{COMPANY_DETAILS.parentCompany}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Official Subsidiary Organization
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Quick Actions</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('book')}
                  className="hover:text-blue-700 transition-colors text-left"
                >
                  Book Solar Cleaning
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-blue-700 transition-colors text-left"
                >
                  Yield Loss & ROI Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('bookings')}
                  className="hover:text-blue-700 transition-colors text-left"
                >
                  Track Existing Booking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-blue-700 transition-colors text-left"
                >
                  AMC Maintenance Plans
                </button>
              </li>
              <li>
                <a
                  href="/qubits-solar.apk"
                  download="qubits-solar.apk"
                  className="text-orange-600 hover:text-orange-700 font-bold transition-colors text-left flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Android .APK</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="text-slate-500 hover:text-amber-700 transition-colors text-left flex items-center gap-1 text-[11px] pt-1"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  <span>Staff / Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Technology & Service Areas */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>Pure De-Ionized RO/DM Water Wash (&lt;10 PPM)</li>
              <li>60-Day Hydrophobic Lotus Anti-Dust Shield</li>
              <li>Inverter Generation Audit & String Diagnostic</li>
              <li>Rooftop Fall-Protection Insured Rigging</li>
              <li>Commercial Solar Shed & Society AMC</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Contact & Portals</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <a href={`tel:${COMPANY_DETAILS.phone}`} className="font-bold text-slate-900 hover:text-orange-600">
                  {COMPANY_DETAILS.phoneDisplay}
                </a>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                  WhatsApp
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href={`tel:${COMPANY_DETAILS.altPhone}`} className="hover:text-blue-700 font-medium text-slate-700">
                  {COMPANY_DETAILS.altPhoneDisplay}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href={`mailto:${COMPANY_DETAILS.email}`} className="hover:text-blue-700 text-slate-700">
                  {COMPANY_DETAILS.email}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <a
                  href={COMPANY_DETAILS.solarWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-600 font-semibold text-slate-800 flex items-center gap-1"
                >
                  <span>{COMPANY_DETAILS.solarWebsite}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Mon - Sun: 7:00 AM - 7:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {COMPANY_DETAILS.name} · {COMPANY_DETAILS.subsidiaryText}.
          </div>
          <div className="flex items-center gap-4">
            <a href={COMPANY_DETAILS.solarWebsiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 font-medium">
              {COMPANY_DETAILS.solarWebsite}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
