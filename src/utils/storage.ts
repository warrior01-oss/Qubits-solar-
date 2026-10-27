import { Booking, CustomerDetails, QuotePricing } from '../types/solar';
import { COMPANY_DETAILS, getWhatsAppUrl } from './pricing';

const STORAGE_KEY = 'qubits_solar_bookings_v1';

export const SEED_BOOKINGS: Booking[] = [];

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out any legacy demo/seed booking so users start completely clean
    const cleaned = parsed.filter(
      (b: any) =>
        b &&
        b.id !== 'QS-2026-9281' &&
        b?.customer?.fullName !== 'Rahul Sharma'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredBookings();
    const updated = [booking, ...current.filter((b) => b.id !== booking.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save booking', e);
  }
}

export function updateBookingStatus(
  bookingId: string,
  newStatus: Booking['status'],
  additionalNotes?: string
): Booking | null {
  if (typeof window === 'undefined') return null;
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return null;

  const target = current[index];
  const updatedBooking: Booking = {
    ...target,
    status: newStatus,
    customer: {
      ...target.customer,
      accessNotes: additionalNotes
        ? `${target.customer.accessNotes || ''}\n[Update]: ${additionalNotes}`.trim()
        : target.customer.accessNotes,
    },
  };

  current[index] = updatedBooking;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return updatedBooking;
}

export function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTimeSlot: string
): Booking | null {
  if (typeof window === 'undefined') return null;
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return null;

  const updatedBooking: Booking = {
    ...current[index],
    scheduledDate: newDate,
    timeSlot: newTimeSlot,
    status: 'rescheduled',
  };

  current[index] = updatedBooking;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return updatedBooking;
}

export function generateBookingId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `QS-${year}-${random}`;
}

export function formatInr(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Creates a pre-filled direct WhatsApp message link to 9250707712
 */
export function buildWhatsAppLink(booking: Booking): string {
  const text = `*New Booking Request - Qubits Solar*
${COMPANY_DETAILS.subsidiaryText}

*Booking ID:* ${booking.id}
*Customer:* ${booking.customer.fullName}
*Phone:* ${booking.customer.phone}
*System Size:* ${booking.systemCapacityKw} kW (${booking.panelCount} panels)
*Roof Type:* ${booking.roofType}
*Package:* ${booking.packageId}
*Frequency:* ${booking.frequency}
*Slot:* ${booking.scheduledDate} (${booking.timeSlot})
*Address:* ${booking.customer.address}, ${booking.customer.city} - ${booking.customer.pincode}
*Total Per Visit:* ${formatInr(booking.pricing.totalPerVisit)} (incl. 18% GST)

Please confirm my technician allocation. Thank you!`;

  return getWhatsAppUrl(text);
}

export function buildInquiryWhatsAppLink(context?: string): string {
  const text = `Hello Qubits Solar (${COMPANY_DETAILS.subsidiaryText}),

I would like to inquire about solar panel cleaning and maintenance services${context ? ` for ${context}` : ''}.
Solar site: ${COMPANY_DETAILS.solarWebsite}
Please share available dates and packages.`;

  return getWhatsAppUrl(text);
}
