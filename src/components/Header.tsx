import React from 'react';
import { Phone, Mail, ExternalLink, Calendar, Calculator, Sparkles, Download, MessageSquare, ShieldCheck } from 'lucide-react';
import { COMPANY_DETAILS, getWhatsAppUrl } from '../utils/pricing';
import { PWAInstallButton } from './PWAInstallButton';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: 'book' | 'calculator' | 'bookings' | 'services' | 'pricing' | 'contact' | 'admin';
  setActiveTab: (tab: 'book' | 'calculator' | 'bookings' | 'services' | 'pricing' | 'contact' | 'admin') => void;
  bookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, bookingsCount }) => {
  const { isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Utility Bar - Light & Professional */}
      <div className="bg-slate-50 border-b border-slate-200/90 text-[11px] sm:text-xs text-slate-600 py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Subsidiary & Brand Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 truncate max-w-full">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span className="font-bold text-slate-900 shrink-0">{COMPANY_DETAILS.name}</span>
            <span className="text-slate-300">·</span>
            <span
              className="inline-flex items-center gap-1 text-slate-700 font-medium truncate"
              title="Parent Company: Qubits Consultancy"
            >
              <img
                src={COMPANY_DETAILS.logoConsultancy}
                alt="Qubits Consultancy"
                className="w-3.5 h-3.5 object-contain inline-block rounded-xs shrink-0"
              />
              <span className="truncate">{COMPANY_DETAILS.subsidiaryText}</span>
            </span>
          </div>

          {/* Quick Contact & Portals */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-orange-600 transition-colors"
              title="Call primary line"
            >
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>{COMPANY_DETAILS.phoneDisplay}</span>
            </a>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <a
              href={`tel:${COMPANY_DETAILS.altPhone}`}
              className="hidden md:flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors"
              title="Call secondary line"
            >
              <Phone className="w-3 h-3 text-blue-600" />
              <span>{COMPANY_DETAILS.altPhoneDisplay}</span>
            </a>

            <span className="text-slate-300 hidden md:inline">|</span>

            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="hidden lg:flex items-center gap-1.5 text-slate-600 hover:text-blue-700 transition-colors"
              title="Email support"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{COMPANY_DETAILS.email}</span>
            </a>

            <span className="text-slate-300 hidden lg:inline">|</span>

            <a
              href={COMPANY_DETAILS.solarWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold transition-colors"
              title="Solar portal"
            >
              <span>{COMPANY_DETAILS.solarWebsite}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand with Official Qubits Solar Logo */}
        <button
          onClick={() => setActiveTab('book')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1 -m-1"
        >
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1 overflow-hidden group-hover:border-blue-300 group-hover:shadow-sm transition-all">
            <img
              src={COMPANY_DETAILS.logoSolar}
              alt="Qubits Solar Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                Qubits <span className="text-orange-500">Solar</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 tracking-normal font-medium flex items-center gap-1">
              <span>Under Qubits Consultancy</span>
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'book'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            Book Cleaning
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'calculator'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-orange-500" />
            <span>Loss Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'services'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            Why DM Water
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'pricing'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            Pricing & AMC
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'contact'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton variant="header" />

          {/* Admin Operations Command Center Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm ring-2 ring-amber-400/20'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-xs'
              }`}
              title="Qubits Solar Operations Command Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Admin Ops</span>
            </button>
          )}

          {/* Google Sign-In & Customer Account */}
          <GoogleAuthButton
            variant="header"
            onNavigateToBookings={() => setActiveTab('bookings')}
            onNavigateToAdmin={() => setActiveTab('admin')}
          />

          {/* My Bookings Tracker */}
          <button
            onClick={() => setActiveTab('bookings')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
              activeTab === 'bookings'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
            title="Track your solar cleaning bookings"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">My Bookings</span>
            {bookingsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* WhatsApp Direct Chat */}
          <a
            href={getWhatsAppUrl('Hello Qubits Solar, I want to book a solar panel cleaning service.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            title="Chat directly on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Primary Quick Booking CTA */}
          <button
            onClick={() => setActiveTab('book')}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-sm shadow-orange-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Now</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-slate-50/90 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'text-amber-900 bg-amber-50 border border-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Ops</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('book')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'book'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Book Cleaning
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'calculator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Loss Calculator
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'services'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Why DM Water
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'pricing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Pricing & AMC
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'contact'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 bg-white border border-slate-200'
          }`}
        >
          Contact Us
        </button>
        <a
          href="/qubits-solar.apk"
          download="qubits-solar.apk"
          className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold border border-orange-200 flex items-center gap-1"
        >
          <Download className="w-3 h-3 text-orange-600" />
          <span>Download .APK</span>
        </a>
      </div>
    </header>
  );
};
