import React, { useState } from 'react';
import {
  Sun,
  Shield,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  Droplet,
  FileText,
  MessageSquare,
  Wrench,
  Percent,
  Star,
  Check,
  ChevronRight,
  Layers,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Booking,
  CleaningPackageId,
  CustomerDetails,
  PropertyType,
  RoofType,
  ServiceFrequency,
  WaterAvailability,
} from '../types/solar';
import {
  AVAILABLE_PACKAGES,
  COMPANY_DETAILS,
  FREQUENCY_PLANS,
  PROPERTY_OPTIONS,
  ROOF_OPTIONS,
  SERVICE_ADDONS,
  WATER_OPTIONS,
  calculateKwFromPanels,
  calculatePanelFromKw,
  calculatePricingQuote,
} from '../utils/pricing';
import {
  buildWhatsAppLink,
  formatInr,
  generateBookingId,
  saveBooking,
} from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from './GoogleAuthButton';

interface BookingWizardProps {
  onBookingCompleted: (booking: Booking) => void;
  onOpenCalculator: () => void;
  initialCapacityKw?: number;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  onBookingCompleted,
  onOpenCalculator,
  initialCapacityKw = 5,
}) => {
  // Booking Mode: 'express' (1-Page quick booking - super easy) vs 'detailed' (4-step wizard)
  const [bookingMode, setBookingMode] = useState<'express' | 'detailed'>('express');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [propertyType, setPropertyType] = useState<PropertyType>('residential_rooftop');
  const [panelCount, setPanelCount] = useState<number>(() => calculatePanelFromKw(initialCapacityKw));
  const [inputMode, setInputMode] = useState<'panels' | 'capacity'>('capacity');
  const [capacityInput, setCapacityInput] = useState<number>(initialCapacityKw);
  const [roofType, setRoofType] = useState<RoofType>('flat_concrete');
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailability>('rooftop_tap');

  const [packageId, setPackageId] = useState<CleaningPackageId>('standard_dm');
  const [frequency, setFrequency] = useState<ServiceFrequency>('one_time');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Next 7 days default
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState<string>(tomorrow);
  const [timeSlot, setTimeSlot] = useState<string>('07:30 AM - 10:30 AM (Morning Peak Cool)');

  // Customer state
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Delhi NCR',
    pincode: '',
    landmark: '',
    accessNotes: '',
  });

  const { user, userProfile } = useAuth();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Auto-fill customer details when signed in with Google
  React.useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || userProfile?.fullName || '',
        email: prev.email || user.email || userProfile?.email || '',
        phone: prev.phone || user.phoneNumber || userProfile?.phone || '',
        address: prev.address || userProfile?.address || '',
        city: prev.city || userProfile?.city || 'Delhi NCR',
        pincode: prev.pincode || userProfile?.pincode || '',
      }));
      setShowSignInModal(false);
    }
  }, [user, userProfile]);

  // Handle Capacity vs Panel sync
  const handlePanelChange = (count: number) => {
    const val = Math.max(1, count);
    setPanelCount(val);
    setCapacityInput(calculateKwFromPanels(val));
  };

  const handleCapacityChange = (kw: number) => {
    const val = Math.max(0.5, kw);
    setCapacityInput(val);
    setPanelCount(calculatePanelFromKw(val));
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Live Price Calculation
  const quote = calculatePricingQuote({
    panelCount,
    packageId,
    frequency,
    roofType,
    selectedAddonIds,
    waterAvailability,
  });

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customer.fullName.trim()) errors.fullName = 'Full Name is required.';

    const phoneClean = customer.phone.replace(/\D/g, '');
    if (!phoneClean) {
      errors.phone = 'Mobile number is required.';
    } else if (phoneClean.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!customer.address.trim()) errors.address = 'Street / House address is required.';
    if (!scheduledDate) errors.scheduledDate = 'Please select a date.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateForm()) return;

    // MANDATORY PROPER SIGN-IN REQUIREMENT
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    setIsSubmittingBooking(true);
    setSubmissionError(null);

    const newBooking: Booking = {
      id: generateBookingId(),
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      propertyType,
      roofType,
      panelCount,
      systemCapacityKw: quote.systemCapacityKw,
      packageId,
      frequency,
      selectedAddonIds,
      waterAvailability,
      scheduledDate,
      timeSlot,
      customer: {
        ...customer,
        email: customer.email || user.email || '',
      },
      pricing: quote,
      assignedTechnician: {
        name: 'Field Service Lead',
        phone: COMPANY_DETAILS.phone,
        rating: 4.95,
        teamLead: 'Certified Solar Rigging Specialist',
      },
    };

    try {
      const result = await saveBooking(newBooking);
      if (!result.success) {
        setSubmissionError(
          result.error || 'Failed to save booking to Cloud Firestore database. Please retry.'
        );
        setIsSubmittingBooking(false);
        return;
      }

      setCompletedBooking(newBooking);
      onBookingCompleted(newBooking);
      setCurrentStep(5);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0B4F9C', '#F58220', '#10B981', '#FFB800'],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'Server error while saving booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Frictionless Solar Booking Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book Solar Panel Cleaning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Demineralized pure water wash &middot; Certified safety crew &middot; Transparent rates
          </p>
        </div>

        {/* Mode Toggle Button */}
        {currentStep < 5 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setBookingMode('express');
                setCurrentStep(1);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                bookingMode === 'express'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Easy 60s Booking</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingMode('detailed');
                setCurrentStep(1);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                bookingMode === 'detailed'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Detailed AMC</span>
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION SCREEN (When booking submitted) */}
      {currentStep === 5 && completedBooking ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Your Solar Cleaning Slot is Reserved!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Booking ID: <strong className="text-blue-700 font-mono text-base">{completedBooking.id}</strong>. A dedicated technician will reach your site at the scheduled time.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">System Size:</span>
                <span className="font-bold text-slate-900 text-sm">{completedBooking.systemCapacityKw} kW ({completedBooking.panelCount} panels)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Date:</span>
                <span className="font-bold text-slate-900 text-sm">{completedBooking.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Plan:</span>
                <span className="font-bold text-slate-900 text-sm">{AVAILABLE_PACKAGES[completedBooking.packageId]?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payable Amount:</span>
                <span className="font-extrabold text-blue-700 text-base">{formatInr(completedBooking.pricing.totalPerVisit)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                Client: <strong className="text-slate-900">{completedBooking.customer.fullName}</strong> ({completedBooking.customer.phone})
              </div>
              <div className="text-slate-500">
                Payment on Service Completion (Cash / UPI)
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={buildWhatsAppLink(completedBooking)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Booking Details to WhatsApp</span>
            </a>

            <a
              href={`tel:${COMPANY_DETAILS.phone}`}
              className="py-3.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Dispatch ({COMPANY_DETAILS.phone})</span>
            </a>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setCompletedBooking(null);
              }}
              className="text-xs text-slate-500 hover:text-blue-700 font-bold transition-colors underline"
            >
              Book Another Solar Installation
            </button>
          </div>
        </div>
      ) : bookingMode === 'express' ? (
        /* MODE 1: EASY 1-PAGE EXPRESS BOOKING */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 1-Page Form */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-7 shadow-sm">
            {/* 1. Quick Capacity Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>1. Select Solar Capacity</span>
                </label>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {capacityInput} kW (~{panelCount} Panels)
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { kw: 3, label: '3 kW (Small Home)', panels: 8 },
                  { kw: 5, label: '5 kW (Standard Villa)', panels: 13 },
                  { kw: 10, label: '10 kW (Large Villa)', panels: 25 },
                  { kw: 25, label: '25 kW (Society/Plant)', panels: 63 },
                ].map((item) => (
                  <button
                    key={item.kw}
                    type="button"
                    onClick={() => handleCapacityChange(item.kw)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      capacityInput === item.kw
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{item.kw} kW</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.panels} panels</div>
                  </button>
                ))}
              </div>

              {/* Slider for fine adjustment */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Custom Capacity Slider</span>
                  <span className="font-bold text-slate-800">{capacityInput} kW</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={capacityInput}
                  onChange={(e) => handleCapacityChange(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* 2. Choose Service Package */}
            <div className="space-y-3 pt-5 border-t border-slate-100">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>2. Choose Cleaning Technology</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPackageId('standard_dm')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    packageId === 'standard_dm'
                      ? 'bg-blue-50 border-blue-600 text-slate-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Pure DM De-Ionized Wash</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    &lt;10 PPM zero-mineral scrub. Prevents calcium white haze and restores 15%–25% lost generation.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageId('hydrophobic_nano')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    packageId === 'hydrophobic_nano'
                      ? 'bg-blue-50 border-blue-600 text-slate-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Hydrophobic Lotus Coat</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Anti-Dust Shield
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Lotus-effect ceramic layer repels pollen and traffic dust for 60 days.
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Date & Time Slot */}
            <div className="space-y-3 pt-5 border-t border-slate-100">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>3. Preferred Schedule</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.scheduledDate && (
                    <span className="text-[11px] text-red-500">{formErrors.scheduledDate}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Select Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="07:30 AM - 10:30 AM (Morning Peak Cool)">
                      07:30 AM – 10:30 AM (Cool Morning - Recommended)
                    </option>
                    <option value="10:30 AM - 01:30 PM (Mid-Day)">
                      10:30 AM – 01:30 PM (Mid-Day)
                    </option>
                    <option value="02:00 PM - 05:00 PM (Afternoon)">
                      02:00 PM – 05:00 PM (Afternoon)
                    </option>
                    <option value="05:00 PM - 07:00 PM (Evening Cool)">
                      05:00 PM – 07:00 PM (Evening Cool)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Customer Contact Info */}
            <div className="space-y-3 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>4. Your Contact & Site Address</span>
                </label>

                {!user ? (
                  <GoogleAuthButton variant="wizard" />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Auto-filled from Google ({user.email})</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.fullName && (
                    <span className="text-[11px] text-red-500">{formErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Mobile / WhatsApp Number *"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-red-500">{formErrors.phone}</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="House / Building Address & Area *"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.address && (
                    <span className="text-[11px] text-red-500">{formErrors.address}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button & Cloud Sync Feedback */}
            <div className="pt-2 space-y-3">
              {submissionError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Cloud Database Sync Failed</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed">{submissionError}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSubmitBooking}
                      disabled={isSubmittingBooking}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingBooking ? 'animate-spin' : ''}`} />
                      <span>Retry Cloud Save</span>
                    </button>
                    <a
                      href={buildWhatsAppLink({
                        id: 'QS-DIRECT',
                        createdAt: new Date().toISOString(),
                        status: 'confirmed',
                        propertyType,
                        roofType,
                        panelCount,
                        systemCapacityKw: quote.systemCapacityKw,
                        packageId,
                        frequency,
                        selectedAddonIds,
                        waterAvailability,
                        scheduledDate,
                        timeSlot,
                        customer: {
                          ...customer,
                          email: customer.email || user?.email || '',
                        },
                        pricing: quote,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Dispatch via WhatsApp Directly</span>
                    </a>
                  </div>
                </div>
              )}

              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!validateForm()) return;
                    setShowSignInModal(true);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/25 transition-all active:scale-98"
                >
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign In with Google to Complete Booking</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : isSubmittingBooking ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-6 rounded-2xl bg-orange-400 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-md cursor-wait opacity-90"
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying & Saving to Cloud Firestore...</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Schedule Solar Cleaning</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <p className="text-center text-[11px] text-slate-500 mt-2">
                {!user
                  ? '🔒 Mandatory verified Google sign-in ensures confirmed booking allocation & direct technician dispatch.'
                  : `Signed in as ${user.displayName || user.email}. Orders are synced live to Cloud Firestore & WhatsApp.`}
              </p>
            </div>
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-sm text-slate-900">Live Quote Breakdown</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Zero Hidden Fees
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <strong className="text-slate-900 font-bold">{quote.systemCapacityKw} kW ({quote.panelCount} Panels)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Base Rate:</span>
                  <strong className="text-slate-900">₹{quote.ratePerPanel} / panel</strong>
                </div>
                <div className="flex justify-between">
                  <span>Service Package:</span>
                  <strong className="text-blue-700">{AVAILABLE_PACKAGES[packageId]?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled Date:</span>
                  <strong className="text-slate-900">{scheduledDate || 'Not selected'}</strong>
                </div>
              </div>

              {/* Total Payable Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-slate-50 to-orange-50/40 border border-blue-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total Payable:</span>
                  <div className="text-2xl font-black text-blue-900">
                    {formatInr(quote.totalPerVisit)}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  Estimated Energy Recovery: +15% to 25% Surge
                </div>
              </div>

              {/* Trust Features */}
              <div className="space-y-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>&lt;10 PPM pure demineralized water</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Soft-bristle carbon-fiber rotary poles</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Insured technicians with full safety harness</span>
                </div>
              </div>

              {/* Direct WhatsApp / Call Hotline */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">Prefer to book by call or chat?</div>
                <div className="flex justify-center gap-3 pt-1 text-xs font-bold text-slate-900">
                  <a href={`tel:${COMPANY_DETAILS.phone}`} className="hover:text-orange-600">
                    {COMPANY_DETAILS.phone}
                  </a>
                  <span>·</span>
                  <a href={`tel:${COMPANY_DETAILS.altPhone}`} className="hover:text-blue-700">
                    {COMPANY_DETAILS.altPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: STEP-BY-STEP DETAILED AMC PLANNER */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Step Progress indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            {[
              { num: 1, label: 'System Setup' },
              { num: 2, label: 'Package & AMC' },
              { num: 3, label: 'Date & Time' },
              { num: 4, label: 'Client Details' },
            ].map((step) => {
              const isCurrent = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className="flex items-center gap-2 group text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      isCurrent ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Step 1: System & Roof */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Property & System Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(PROPERTY_OPTIONS) as PropertyType[]).map((type) => {
                  const item = PROPERTY_OPTIONS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        propertyType === type
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Roof Type */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Rooftop Architecture</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(ROOF_OPTIONS) as RoofType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoofType(r)}
                      className={`p-3 rounded-xl text-center border text-xs font-semibold ${
                        roofType === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ROOF_OPTIONS[r].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">System Capacity: {capacityInput} kW ({panelCount} panels)</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="0.5"
                  value={capacityInput}
                  onChange={(e) => handleCapacityChange(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <span>Next: Package & AMC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Package & AMC */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Service Plan & Maintenance Frequency</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(AVAILABLE_PACKAGES) as CleaningPackageId[]).map((pkg) => {
                  const p = AVAILABLE_PACKAGES[pkg];
                  return (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => setPackageId(pkg)}
                      className={`p-5 rounded-2xl text-left border transition-all ${
                        packageId === pkg
                          ? 'bg-blue-50 border-blue-600 text-slate-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">{p.name}</div>
                      <div className="text-xs text-orange-600 font-semibold mt-0.5">{p.tagline}</div>
                      <p className="text-xs text-slate-500 mt-2">{p.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Frequency / AMC */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Maintenance Frequency (AMC Discounts)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(FREQUENCY_PLANS) as ServiceFrequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`p-3 rounded-xl text-center border text-xs font-semibold ${
                        frequency === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>{FREQUENCY_PLANS[f].label}</div>
                      {FREQUENCY_PLANS[f].discountPercent > 0 && (
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          Save {FREQUENCY_PLANS[f].discountPercent}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <span>Next: Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Slot */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Select Date & Time Window</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Date</label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time Window</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  >
                    <option value="07:30 AM - 10:30 AM (Morning Peak Cool)">
                      07:30 AM – 10:30 AM (Cool Morning)
                    </option>
                    <option value="10:30 AM - 01:30 PM (Mid-Day)">
                      10:30 AM – 01:30 PM (Mid-Day)
                    </option>
                    <option value="02:00 PM - 05:00 PM (Afternoon)">
                      02:00 PM – 05:00 PM (Afternoon)
                    </option>
                    <option value="05:00 PM - 07:00 PM (Evening Cool)">
                      05:00 PM – 07:00 PM (Evening Cool)
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <span>Next: Client Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Client Info & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Contact & Rooftop Address</h3>
                {!user ? (
                  <GoogleAuthButton variant="wizard" />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-filled from Google ({user.email})</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.fullName && <span className="text-xs text-red-500">{formErrors.fullName}</span>}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Mobile / WhatsApp Number *"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Complete Street Address & Landmark *"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.address && <span className="text-xs text-red-500">{formErrors.address}</span>}
                </div>
              </div>

              {submissionError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Cloud Database Sync Failed</span>
                  </div>
                  <p className="text-rose-700">{submissionError}</p>
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    disabled={isSubmittingBooking}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmittingBooking ? 'animate-spin' : ''}`} />
                    <span>Retry Saving</span>
                  </button>
                </div>
              )}

              {/* Price summary highlight */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-600">Total Payable ({quote.systemCapacityKw} kW):</div>
                  <div className="text-2xl font-black text-blue-900">{formatInr(quote.totalPerVisit)}</div>
                </div>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!validateForm()) return;
                      setShowSignInModal(true);
                    }}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-black text-sm rounded-xl shadow-xs flex items-center gap-2"
                  >
                    <span>Sign In to Confirm Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isSubmittingBooking ? (
                  <button
                    type="button"
                    disabled
                    className="px-6 py-3.5 bg-orange-400 text-white font-black text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-wait opacity-90"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-xs"
                  >
                    Confirm Booking Now
                  </button>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900">Sign in with Google Required</h3>
              <p className="text-xs text-slate-600">
                To confirm your solar cleaning slot and dispatch our certified technician crew, please sign in with your Google account.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified customer appointment & slot reservation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant order tracking across all your phones & devices</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct WhatsApp receipt & technician contact</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <GoogleAuthButton variant="wizard" />

              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel and return to form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
