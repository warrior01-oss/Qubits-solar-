import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BookingWizard } from './components/BookingWizard';
import { SoilingLossCalculator } from './components/SoilingLossCalculator';
import { MyBookingsView } from './components/MyBookingsView';
import { ServicesShowcase } from './components/ServicesShowcase';
import { PricingTable } from './components/PricingTable';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Booking } from './types/solar';
import { getStoredBookings } from './utils/storage';
import { COMPANY_DETAILS, getWhatsAppUrl } from './utils/pricing';
import { MessageSquare, Phone, ArrowUp, Download, Sparkles } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallAPKModal } from './components/InstallAPKModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'book' | 'calculator' | 'bookings' | 'services' | 'pricing' | 'contact'
  >('book');

  const [prefilledCapacityKw, setPrefilledCapacityKw] = useState<number>(5);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showAPKModal, setShowAPKModal] = useState<boolean>(false);

  // Sync stored bookings count on mount
  useEffect(() => {
    const list = getStoredBookings();
    setBookingsCount(list.length);

    // Check URL parameters if requested (e.g. ?tab=bookings or ?tab=calculator or ?apk=1)
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['book', 'calculator', 'bookings', 'services', 'pricing', 'contact'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
      if (params.get('apk') || params.get('install') || params.get('download')) {
        setShowAPKModal(true);
      }
    } catch {
      // ignore
    }

    const handleOpenApk = () => setShowAPKModal(true);
    window.addEventListener('open-apk-modal', handleOpenApk);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-apk-modal', handleOpenApk);
    };
  }, []);

  const handleBookingCompleted = (booking: Booking) => {
    const updated = getStoredBookings();
    setBookingsCount(updated.length);
  };

  const handleSelectFromCalculator = (capacityKw: number) => {
    setPrefilledCapacityKw(capacityKw);
    setActiveTab('book');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#F58220]/20 selection:text-[#0B4F9C] overflow-x-hidden w-full max-w-full">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookingsCount={bookingsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 sm:pb-8">
        {/* Render Hero only on booking tab */}
        {activeTab === 'book' && (
          <HeroSection
            onStartBooking={() => {
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCalculator={() => {
              setActiveTab('calculator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCapacity={(kw) => {
              setPrefilledCapacityKw(kw);
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
          {/* TAB 1: Booking Wizard */}
          {activeTab === 'book' && (
            <section id="booking-section" className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider block">
                  Online Reservation
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Schedule Solar Panel Cleaning
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Configure your solar setup, select pure de-ionized water or hydrophobic coating, and get an instant transparent quote.
                </p>
              </div>

              <BookingWizard
                key={prefilledCapacityKw}
                initialCapacityKw={prefilledCapacityKw}
                onBookingCompleted={handleBookingCompleted}
                onOpenCalculator={() => {
                  setActiveTab('calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </section>
          )}

          {/* TAB 2: Generation Loss Calculator */}
          {activeTab === 'calculator' && (
            <SoilingLossCalculator onSelectForBooking={handleSelectFromCalculator} />
          )}

          {/* TAB 3: My Bookings Tracker */}
          {activeTab === 'bookings' && (
            <MyBookingsView
              onNewBookingClick={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB 4: Services & Science Showcase */}
          {activeTab === 'services' && (
            <ServicesShowcase
              onStartBooking={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB 5: Pricing & AMC */}
          {activeTab === 'pricing' && (
            <PricingTable
              onStartBooking={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* TAB 6: Contact & Support */}
          {activeTab === 'contact' && (
            <ContactSection
              onStartBooking={() => {
                setActiveTab('book');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (WhatsApp & Quick Call) */}
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30 flex flex-col items-end gap-2 sm:gap-3">
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#0B4F9C] hover:border-[#0B4F9C] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <a
            href={`tel:${COMPANY_DETAILS.phone}`}
            aria-label="Call Qubits Solar"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-[#0B4F9C] text-slate-800 text-xs font-semibold shadow-lg transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#0B4F9C]" />
            <span>{COMPANY_DETAILS.phone}</span>
          </a>

          <a
            href={getWhatsAppUrl('Hello Qubits Solar, I want to book a solar cleaning visit.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp: {COMPANY_DETAILS.phone}</span>
          </a>
        </div>
      </div>

      {/* Mobile Sticky Quick Navigation Bar (Active on All Phone Screens) */}
      <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('book');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold transition-all min-w-[56px] ${
            activeTab === 'book'
              ? 'text-[#0B4F9C]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 ${activeTab === 'book' ? 'text-[#F58220]' : 'text-slate-500'}`} />
          <span>Book</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('calculator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold transition-all min-w-[56px] ${
            activeTab === 'calculator'
              ? 'text-[#0B4F9C]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="text-xs mb-0.5 font-mono">⚡</span>
          <span>Loss Calc</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold transition-all min-w-[56px] ${
            activeTab === 'bookings'
              ? 'text-[#0B4F9C]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="text-xs mb-0.5">📋</span>
          <span>My Orders</span>
          {bookingsCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#F58220] text-white text-[9px] font-black flex items-center justify-center">
              {bookingsCount}
            </span>
          )}
        </button>

        <a
          href={getWhatsAppUrl('Hello Qubits Solar, I want to book a solar cleaning visit.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold text-emerald-600 min-w-[56px]"
        >
          <MessageSquare className="w-4 h-4 mb-0.5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`tel:${COMPANY_DETAILS.phone}`}
          className="flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold text-[#0B4F9C] min-w-[56px]"
        >
          <Phone className="w-4 h-4 mb-0.5 text-[#0B4F9C]" />
          <span>Call Us</span>
        </a>
      </nav>

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Offline Mode Indicator */}
      <OfflineIndicator />

      {/* APK & App Installation Modal */}
      <InstallAPKModal
        isOpen={showAPKModal}
        onClose={() => setShowAPKModal(false)}
      />
    </div>
  );
}
