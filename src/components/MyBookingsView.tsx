import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  FileText,
  X,
  RefreshCw,
  Trash2,
  User,
  ShieldCheck,
  ChevronRight,
  Star,
  Download,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types/solar';
import { AVAILABLE_PACKAGES, COMPANY_DETAILS, FREQUENCY_PLANS, ROOF_OPTIONS } from '../utils/pricing';
import {
  buildWhatsAppLink,
  formatInr,
  getStoredBookings,
  rescheduleBooking,
  updateBookingStatus,
  fetchAndSyncCloudBookings,
} from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from './GoogleAuthButton';

interface MyBookingsViewProps {
  onNewBookingClick: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onNewBookingClick }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [viewReceiptBooking, setViewReceiptBooking] = useState<Booking | null>(null);

  // Sync with Firestore whenever user signs in or changes
  useEffect(() => {
    if (user) {
      setSyncing(true);
      fetchAndSyncCloudBookings(user.uid)
        .then((merged) => setBookings(merged))
        .catch((e) => console.warn('Could not sync cloud bookings:', e))
        .finally(() => setSyncing(false));
    } else {
      setBookings(getStoredBookings());
    }
  }, [user]);

  // Reschedule form state
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [newDate, setNewDate] = useState<string>(tomorrow);
  const [newSlot, setNewSlot] = useState<string>('07:30 AM - 10:30 AM (Morning Peak Cool)');

  const refreshList = async () => {
    if (user) {
      setSyncing(true);
      const synced = await fetchAndSyncCloudBookings(user.uid);
      setBookings(synced);
      setSyncing(false);
    } else {
      setBookings(getStoredBookings());
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBookingForReschedule) return;
    await rescheduleBooking(selectedBookingForReschedule.id, newDate, newSlot);
    setSelectedBookingForReschedule(null);
    await refreshList();
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    await updateBookingStatus(selectedBookingForCancel.id, 'cancelled', 'Cancelled by customer via portal.');
    setSelectedBookingForCancel(null);
    await refreshList();
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Booking Confirmed
          </span>
        );
      case 'technician_assigned':
        return (
          <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Crew Allocated
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping" />
            Cleaning In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">
            Rescheduled
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Solar Service Bookings
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track scheduled cleanings, field technician arrival status, and download maintenance receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewBookingClick}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-sm transition-all shadow-xs self-start sm:self-auto"
        >
          + Book New Cleaning
        </button>
      </div>

      {/* Google Sign-in Sync Status Banner */}
      {user ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Connected as <strong className="font-bold">{user.displayName || user.email}</strong>. Bookings are backed up to Google Cloud.
            </span>
          </div>
          {syncing && (
            <span className="text-[11px] text-emerald-700 animate-pulse font-semibold">
              Syncing latest orders...
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-blue-900">
              Want to access bookings from your phone or another computer?
            </p>
            <p className="text-xs text-blue-700">
              Sign in with your Google account to automatically link and synchronize all your solar service orders.
            </p>
          </div>
          <GoogleAuthButton variant="wizard" />
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No active bookings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule your first pure DM de-ionized wash or get an instant quote in less than 60 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={onNewBookingClick}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs"
          >
            Start 60s Booking
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const pkg = AVAILABLE_PACKAGES[booking.packageId];
            const isCancelled = booking.status === 'cancelled';
            return (
              <div
                key={booking.id}
                className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all shadow-sm ${
                  isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {booking.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-orange-600 font-bold">Qubits Solar</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4 text-xs">
                  {/* Slot & Location */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{booking.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {booking.customer.address}, {booking.customer.city}
                      </span>
                    </div>
                  </div>

                  {/* System & Package */}
                  <div className="space-y-1.5">
                    <div className="text-slate-600">
                      System Size:{' '}
                      <strong className="text-slate-900">
                        {booking.panelCount} Panels ({booking.systemCapacityKw} kW)
                      </strong>
                    </div>
                    <div className="text-slate-600">
                      Package: <strong className="text-slate-900">{pkg?.name}</strong>
                    </div>
                    <div className="text-slate-600">
                      Plan: <span className="text-blue-700 font-semibold">{FREQUENCY_PLANS[booking.frequency]?.label}</span>
                    </div>
                  </div>

                  {/* Pricing & Assigned Technician */}
                  <div className="space-y-2 md:text-right">
                    <div className="text-slate-500 text-[11px]">Total Per Visit:</div>
                    <div className="text-xl font-black text-blue-900">
                      {formatInr(booking.pricing.totalPerVisit)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Client: <strong>{booking.customer.fullName}</strong> ({booking.customer.phone})
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <a
                      href={buildWhatsAppLink(booking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Coordinator</span>
                    </a>

                    <a
                      href={`tel:${COMPANY_DETAILS.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-orange-600" />
                      <span>Call Dispatch</span>
                    </a>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForReschedule(booking)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForCancel(booking)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedBookingForReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Reschedule Service Slot</h3>
              <button
                type="button"
                onClick={() => setSelectedBookingForReschedule(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select New Date</label>
                <input
                  type="date"
                  min={tomorrow}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Time Window</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="07:30 AM - 10:30 AM (Morning Peak Cool)">07:30 AM – 10:30 AM (Morning Cool)</option>
                  <option value="10:30 AM - 01:30 PM (Mid-Day)">10:30 AM – 01:30 PM (Mid-Day)</option>
                  <option value="02:00 PM - 05:00 PM (Afternoon)">02:00 PM – 05:00 PM (Afternoon)</option>
                  <option value="05:00 PM - 07:00 PM (Evening Cool)">05:00 PM – 07:00 PM (Evening Cool)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForReschedule(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Cancel Booking {selectedBookingForCancel.id}?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this solar cleaning appointment? You can re-book anytime in 60 seconds.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold text-xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
