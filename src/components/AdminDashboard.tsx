import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Trash2,
  Wrench,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types/solar';
import { AVAILABLE_PACKAGES, COMPANY_DETAILS, getWhatsAppUrl } from '../utils/pricing';
import {
  fetchAllAdminBookings,
  adminUpdateBooking,
  adminDeleteBooking,
  formatInr,
} from '../utils/storage';
import { useAuth, ADMIN_EMAILS } from '../context/AuthContext';
import { GoogleAuthButton } from './GoogleAuthButton';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [techNameInput, setTechNameInput] = useState<string>('');
  const [techPhoneInput, setTechPhoneInput] = useState<string>('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const FIREBASE_CONSOLE_URL =
    'https://console.firebase.google.com/project/gen-lang-client-0626638507/firestore/databases/ai-studio-qubitssolarsolar-d2e383ae-ca27-4730-94a5-e0e2b430341f/data';
  const FIREBASE_AUTH_URL =
    'https://console.firebase.google.com/project/gen-lang-client-0626638507/authentication/users';

  const loadAllBookings = async () => {
    setIsLoading(true);
    try {
      const list = await fetchAllAdminBookings();
      setBookings(list);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllBookings();
    }
  }, [isAdmin]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setStatusUpdatingId(bookingId);
    try {
      await adminUpdateBooking(bookingId, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSaveTechnician = async (bookingId: string) => {
    if (!techNameInput.trim()) return;
    try {
      await adminUpdateBooking(bookingId, {
        technicianName: techNameInput.trim(),
        technicianPhone: techPhoneInput.trim() || COMPANY_DETAILS.phone,
        status: 'technician_assigned',
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'technician_assigned',
                assignedTechnician: {
                  name: techNameInput.trim(),
                  phone: techPhoneInput.trim() || COMPANY_DETAILS.phone,
                  rating: 4.95,
                  teamLead: 'Certified Solar Rigging Specialist',
                },
              }
            : b
        )
      );
      setEditingTechId(null);
    } catch (err) {
      console.error('Failed to assign technician', err);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (window.confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
      await adminDeleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.id.toLowerCase().includes(query) ||
      b.customer.fullName.toLowerCase().includes(query) ||
      b.customer.phone.includes(query) ||
      (b.customer.email && b.customer.email.toLowerCase().includes(query)) ||
      b.customer.address.toLowerCase().includes(query) ||
      b.customer.city.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // KPI calculations
  const totalValue = bookings.reduce((sum, b) => sum + (b.pricing?.totalPerVisit || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const inProgressCount = bookings.filter((b) => b.status === 'in_progress').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
        <p className="text-sm text-slate-600 font-semibold">Checking administrator authorization...</p>
      </div>
    );
  }

  // Non-admin gate
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Admin Command Center</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            This dashboard is reserved for Qubits Solar operations staff to view all confirmed customer bookings, allocate technicians, and manage job statuses.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2 text-left">
          <p className="font-bold text-slate-800">Authorized Admin Accounts:</p>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-blue-700">
            {ADMIN_EMAILS.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
          {user && (
            <p className="text-rose-600 font-semibold pt-1">
              Currently logged in as: <strong className="font-mono">{user.email}</strong> (Unauthorized)
            </p>
          )}
        </div>

        <div className="pt-2 flex justify-center">
          <GoogleAuthButton variant="wizard" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner & Firebase Cloud Portals */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verified: {user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Qubits Solar Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live customer bookings pipeline &middot; Real-time Cloud Firestore synchronization
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadAllBookings}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href={FIREBASE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs"
              title="Open Cloud Firestore Database in Google Firebase Console"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Firestore Console</span>
            </a>

            <a
              href={FIREBASE_AUTH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
              title="Open Google Firebase Authentication Users"
            >
              <User className="w-3.5 h-3.5" />
              <span>Auth Users</span>
            </a>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{bookings.length}</span>
          <span className="text-[11px] text-blue-600 font-semibold">All-time bookings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-bold text-blue-700 block">Needs Crew</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">{confirmedCount}</span>
          <span className="text-[11px] text-blue-600 font-semibold">Confirmed bookings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-bold text-amber-700 block">Active Service</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{inProgressCount}</span>
          <span className="text-[11px] text-amber-600 font-semibold">On-site cleanings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 block">Completed</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{completedCount}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Successful washes</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-bold text-orange-800 block">Pipeline Revenue</span>
          <span className="text-2xl font-black text-orange-900 mt-1 block">{formatInr(totalValue)}</span>
          <span className="text-[11px] text-orange-700 font-semibold">Gross service booking</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, booking ID, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'technician_assigned', label: 'Crew Assigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / Cards */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No bookings match the filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No bookings found for "${searchQuery}". Clear your search query.`
              : 'New customer bookings confirmed on the website will instantly appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const pkg = AVAILABLE_PACKAGES[booking.packageId];
            const isEditingTech = editingTechId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-5 sm:p-6 shadow-sm transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {booking.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      Booked on{' '}
                      {new Date(booking.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selector */}
                    <div className="relative">
                      <select
                        value={booking.status}
                        disabled={statusUpdatingId === booking.id}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                          booking.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : booking.status === 'technician_assigned'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : booking.status === 'in_progress'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                            : booking.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="technician_assigned">Crew Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(booking.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main 3-column details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Customer Details & Contact Actions */}
                  <div className="space-y-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{booking.customer.fullName}</span>
                    </span>
                    <p className="text-slate-600 truncate">{booking.customer.email || 'No email specified'}</p>
                    <p className="font-mono font-bold text-slate-800 text-sm">{booking.customer.phone}</p>

                    {/* Quick Contact Buttons for Admin */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${booking.customer.phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={getWhatsAppUrl(
                          `Hello ${booking.customer.fullName}, this is Qubits Solar regarding your solar cleaning booking ${booking.id} scheduled for ${booking.scheduledDate}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Column 2: Solar Plant & Rooftop Info */}
                  <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <span className="font-extrabold text-slate-900 block text-xs">
                      Plant: {booking.systemCapacityKw} kW ({booking.panelCount} Panels)
                    </span>
                    <p className="text-slate-600">
                      <strong>Roof:</strong> {booking.roofType.replace(/_/g, ' ')} &middot;{' '}
                      <strong>Property:</strong> {booking.propertyType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-700 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {booking.customer.address}, {booking.customer.city} - {booking.customer.pincode}
                      </span>
                    </p>
                    {booking.customer.accessNotes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        <strong>Notes:</strong> {booking.customer.accessNotes}
                      </p>
                    )}
                  </div>

                  {/* Column 3: Scheduled Date, Package & Price */}
                  <div className="space-y-1.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-blue-900 text-sm">
                        {formatInr(booking.pricing?.totalPerVisit || 0)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{booking.frequency}</span>
                    </div>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{booking.scheduledDate}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{booking.timeSlot}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-blue-700">{pkg?.name || booking.packageId}</p>
                  </div>
                </div>

                {/* Technician Allocation Footer */}
                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    {booking.assignedTechnician ? (
                      <span className="text-slate-800 font-semibold">
                        Assigned Tech: <strong className="text-slate-900">{booking.assignedTechnician.name}</strong> ({booking.assignedTechnician.phone})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        ⚠️ No technician allocated yet
                      </span>
                    )}
                  </div>

                  {isEditingTech ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tech Name (e.g. Ramesh)"
                        value={techNameInput}
                        onChange={(e) => setTechNameInput(e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg w-36"
                      />
                      <input
                        type="tel"
                        placeholder="Tech Phone"
                        value={techPhoneInput}
                        onChange={(e) => setTechPhoneInput(e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg w-32"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTechnician(booking.id)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTechId(null)}
                        className="px-2 py-1 text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTechId(booking.id);
                        setTechNameInput(booking.assignedTechnician?.name || '');
                        setTechPhoneInput(booking.assignedTechnician?.phone || '');
                      }}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      {booking.assignedTechnician ? 'Reassign Crew' : '+ Allocate Crew'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
