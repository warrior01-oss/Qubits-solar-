import React, { useState } from 'react';
import { Phone, Mail, Globe, MapPin, MessageSquare, Clock, Send, CheckCircle2, ShieldCheck, ExternalLink, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { COMPANY_DETAILS, getWhatsAppUrl } from '../utils/pricing';

interface ContactSectionProps {
  onStartBooking?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onStartBooking }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('5 kW');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Trigger WhatsApp redirect with the user's message
    const waText = `Hello Qubits Solar (${COMPANY_DETAILS.subsidiaryText}),
My Name: ${name}
Phone: ${phone}
Solar Capacity: ${capacity}
Query: ${message || 'I want to schedule a solar panel cleaning visit.'}
Solar Site: ${COMPANY_DETAILS.solarWebsite}
Parent Company: ${COMPANY_DETAILS.website}`;

    const targetUrl = getWhatsAppUrl(waText);
    setSubmitted(true);
    window.location.href = targetUrl;
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-4 sm:py-6">
      {/* Direct Online Booking Action Banner */}
      {onStartBooking && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-blue-900/15">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ready for Immediate Service?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Book Your Cleaning Visit Online in 60s
            </h3>
            <p className="text-xs sm:text-sm text-blue-200">
              Get an instant quote with pure DM demineralized water and select your preferred technician time slot.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartBooking}
            className="w-full sm:w-auto shrink-0 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/30 transition-transform active:scale-95"
          >
            <span>Start Express Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
          Direct Customer Support
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Contact Qubits Solar
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          A subsidiary under <strong className="text-slate-900 font-semibold">{COMPANY_DETAILS.parentCompany}</strong>. Direct field coordinators ready for rooftop villas, societies, and industrial solar plants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Phone & WhatsApp Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Call & WhatsApp
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Primary Hotline & WhatsApp</div>
              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="text-2xl font-black text-slate-900 hover:text-orange-600 transition-colors block mt-1"
              >
                {COMPANY_DETAILS.phoneDisplay}
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Available for calls and instant WhatsApp bookings</div>
            </div>
            <div className="flex gap-2 pt-1">
              <a
                href={`tel:${COMPANY_DETAILS.phone}`}
                className="flex-1 text-center py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Call Primary
              </a>
              <a
                href={getWhatsAppUrl('Hello Qubits Solar, I want to book a solar cleaning visit.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Secondary Phone Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                Alternate Line
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Alternate Support Line</div>
              <a
                href={`tel:${COMPANY_DETAILS.altPhone}`}
                className="text-xl font-bold text-slate-900 hover:text-blue-700 transition-colors block mt-1"
              >
                {COMPANY_DETAILS.altPhoneDisplay}
              </a>
              <div className="text-xs text-slate-500 mt-0.5">Direct line: 8303036018</div>
            </div>
            <a
              href={`tel:${COMPANY_DETAILS.altPhone}`}
              className="inline-block py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Call {COMPANY_DETAILS.altPhone}
            </a>
          </div>

          {/* Websites Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">Solar Cleaning Portal</div>
                <a
                  href={COMPANY_DETAILS.solarWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-extrabold text-blue-700 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <span>{COMPANY_DETAILS.solarWebsite}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Parent Organization</div>
                <div className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <img
                    src={COMPANY_DETAILS.logoConsultancy}
                    alt="Qubits Consultancy"
                    className="w-4 h-4 object-contain inline-block rounded-xs"
                  />
                  <span>{COMPANY_DETAILS.parentCompany}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Qubits Solar is an official subsidiary under Qubits Consultancy.
                </p>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Official Email Address</div>
              <a
                href={`mailto:${COMPANY_DETAILS.email}`}
                className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors block mt-1"
              >
                {COMPANY_DETAILS.email}
              </a>
              <div className="text-[11px] text-slate-500 mt-0.5">
                For corporate AMC proposals, tenders & billing inquiries.
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Service Hours: </span>
              <span>{COMPANY_DETAILS.hours} (All 7 Days)</span>
            </div>
          </div>
        </div>

        {/* Quick Inquiry Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Send a Quick Message / Request Callback</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Have questions about your rooftop angle, water access, or need a society quotation? Leave your number and our lead field technician will call or WhatsApp you within 15 minutes.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-emerald-900">
              <div className="flex items-center gap-2 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Inquiry Dispatched to WhatsApp!</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you, <strong>{name}</strong>! Your message has been sent to Qubits Solar coordinators at <strong>+91 9250707712</strong>. We will confirm your details shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9250707712"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Approximate Solar System Capacity
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['3 kW (Villa)', '5 kW (Home)', '10 kW (Society)', '25+ kW (Plant)'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCapacity(opt)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        capacity === opt
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Your Query or Special Requirements
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Need quotation for our society rooftop with 40 panels. Tap water is salty so need DM water tanker."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Chat on WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Spam Guarantee</span>
                </div>
                <span>·</span>
                <div>
                  Direct Line: <strong className="text-slate-700">9250707712</strong>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
