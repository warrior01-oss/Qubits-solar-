import { Booking, CustomerDetails, QuotePricing } from '../types/solar';
import { COMPANY_DETAILS, getWhatsAppUrl } from './pricing';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';

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

export function saveLocalBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredBookings();
    const updated = [booking, ...current.filter((b) => b.id !== booking.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save booking locally', e);
  }
}

export interface SaveBookingResult {
  success: boolean;
  cloudSynced: boolean;
  error?: string;
}

/**
 * Saves a booking to both LocalStorage and Cloud Firestore (if signed in).
 * Returns clear cloud sync outcome so failure is never silent.
 */
export async function saveBooking(booking: Booking): Promise<SaveBookingResult> {
  // Always save locally so data is cached on device
  saveLocalBooking(booking);

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      success: true,
      cloudSynced: false,
      error: 'Not signed in with a Google account. Booking saved locally only.',
    };
  }

  const path = `bookings/${booking.id}`;
  try {
    const bookingDoc = {
      id: booking.id,
      userId: currentUser.uid,
      customerName: booking.customer.fullName || 'Customer',
      customerPhone: booking.customer.phone || '',
      customerEmail: booking.customer.email || currentUser.email || '',
      address: booking.customer.address || '',
      city: booking.customer.city || '',
      pincode: booking.customer.pincode || '',
      systemCapacityKw: Number(booking.systemCapacityKw) || 0,
      panelCount: Number(booking.panelCount) || 0,
      propertyType: booking.propertyType || 'residential_rooftop',
      roofType: booking.roofType || 'flat_concrete',
      packageId: booking.packageId || 'standard_dm',
      frequency: booking.frequency || 'one_time',
      scheduledDate: booking.scheduledDate,
      timeSlot: booking.timeSlot,
      totalAmount: Number(booking.pricing.totalPerVisit) || 0,
      status: 'confirmed',
      waterAvailability: booking.waterAvailability || 'rooftop_tap',
      notes: booking.customer.accessNotes || '',
      createdAt: booking.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'bookings', booking.id), bookingDoc);
    return { success: true, cloudSynced: true };
  } catch (error: any) {
    console.error('Failed to sync booking to Cloud Firestore:', error);
    const msg = error?.message || 'Database connection error. Could not reach operations server.';
    return { success: false, cloudSynced: false, error: msg };
  }
}

/**
 * Loads cloud bookings for the signed-in user and merges them into local storage
 */
export async function fetchAndSyncCloudBookings(userId: string): Promise<Booking[]> {
  const local = getStoredBookings();
  if (!userId) return local;

  const path = 'bookings';
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const cloudBookings: Booking[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const reconstructed: Booking = {
        id: data.id || docSnap.id,
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'confirmed',
        propertyType: data.propertyType || 'residential_rooftop',
        roofType: data.roofType || 'flat_concrete',
        panelCount: data.panelCount || 10,
        systemCapacityKw: data.systemCapacityKw || 5,
        packageId: data.packageId || 'standard_dm',
        frequency: data.frequency || 'one_time',
        selectedAddonIds: [],
        waterAvailability: data.waterAvailability || 'rooftop_tap',
        scheduledDate: data.scheduledDate,
        timeSlot: data.timeSlot,
        customer: {
          fullName: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || '',
          address: data.address || '',
          city: data.city || 'Lucknow',
          pincode: data.pincode || '',
          accessNotes: data.notes || '',
        },
        pricing: {
          panelCount: data.panelCount || 10,
          systemCapacityKw: data.systemCapacityKw || 5,
          baseRatePerPanel: 35,
          rawBaseTotal: data.totalAmount || 1000,
          minimumChargeApplied: false,
          packageMultiplier: 1,
          packageSubtotal: data.totalAmount || 1000,
          frequencyDiscountPercent: 0,
          frequencyDiscountAmount: 0,
          frequencyVisitsPerYear: 1,
          addonTotal: 0,
          taxAmount: Math.round((data.totalAmount || 1000) * 0.18),
          totalPerVisit: data.totalAmount || 1000,
          annualEstimate: data.totalAmount || 1000,
          estimatedUnitsRecoveredMonthly: Math.round((data.systemCapacityKw || 5) * 20),
          estimatedMonthlySavingsInr: Math.round((data.systemCapacityKw || 5) * 140),
        },
      };
      cloudBookings.push(reconstructed);
    });

    // Merge: union by id, prioritizing cloud bookings
    const map = new Map<string, Booking>();
    local.forEach((b) => map.set(b.id, b));
    cloudBookings.forEach((b) => map.set(b.id, b));

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Could not fetch cloud bookings:', err);
    return local;
  }
}

/**
 * Loads ALL bookings across all customers for authorized Admin users from Cloud Firestore
 */
export async function fetchAllAdminBookings(): Promise<Booking[]> {
  const local = getStoredBookings();
  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    const cloudBookings: Booking[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const reconstructed: Booking = {
        id: data.id || docSnap.id,
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'confirmed',
        propertyType: data.propertyType || 'residential_rooftop',
        roofType: data.roofType || 'flat_concrete',
        panelCount: data.panelCount || 10,
        systemCapacityKw: data.systemCapacityKw || 5,
        packageId: data.packageId || 'standard_dm',
        frequency: data.frequency || 'one_time',
        selectedAddonIds: [],
        waterAvailability: data.waterAvailability || 'rooftop_tap',
        scheduledDate: data.scheduledDate,
        timeSlot: data.timeSlot,
        customer: {
          fullName: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || '',
          address: data.address || '',
          city: data.city || 'Lucknow',
          pincode: data.pincode || '',
          accessNotes: data.notes || '',
        },
        assignedTechnician: data.technicianName
          ? {
              name: data.technicianName,
              phone: data.technicianPhone || COMPANY_DETAILS.phone,
              rating: 4.95,
              teamLead: 'Certified Qubits Rigging Specialist',
            }
          : undefined,
        pricing: {
          panelCount: data.panelCount || 10,
          systemCapacityKw: data.systemCapacityKw || 5,
          baseRatePerPanel: 35,
          rawBaseTotal: data.totalAmount || 1000,
          minimumChargeApplied: false,
          packageMultiplier: 1,
          packageSubtotal: data.totalAmount || 1000,
          frequencyDiscountPercent: 0,
          frequencyDiscountAmount: 0,
          frequencyVisitsPerYear: 1,
          addonTotal: 0,
          taxAmount: Math.round((data.totalAmount || 1000) * 0.18),
          totalPerVisit: data.totalAmount || 1000,
          annualEstimate: data.totalAmount || 1000,
          estimatedUnitsRecoveredMonthly: Math.round((data.systemCapacityKw || 5) * 20),
          estimatedMonthlySavingsInr: Math.round((data.systemCapacityKw || 5) * 140),
        },
      };
      cloudBookings.push(reconstructed);
    });

    const map = new Map<string, Booking>();
    local.forEach((b) => map.set(b.id, b));
    cloudBookings.forEach((b) => map.set(b.id, b));

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Could not fetch admin bookings:', err);
    return local;
  }
}

export async function adminUpdateBooking(
  bookingId: string,
  updates: {
    status?: Booking['status'];
    technicianName?: string;
    technicianPhone?: string;
    notes?: string;
  }
): Promise<void> {
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.technicianName
        ? {
            assignedTechnician: {
              name: updates.technicianName,
              phone: updates.technicianPhone || COMPANY_DETAILS.phone,
              rating: 4.9,
              teamLead: 'Qubits Field Lead',
            },
          }
        : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  try {
    const ref = doc(db, 'bookings', bookingId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to update booking in Firestore:', err);
  }
}

export async function adminDeleteBooking(bookingId: string): Promise<void> {
  const current = getStoredBookings().filter((b) => b.id !== bookingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (err) {
    console.error('Failed to delete booking in Firestore:', err);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: Booking['status'],
  additionalNotes?: string
): Promise<{ success: boolean; booking: Booking | null; error?: string }> {
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return { success: false, booking: null, error: 'Booking not found' };

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

  // Update in Firestore if signed in
  if (auth.currentUser) {
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, {
        status: newStatus,
        notes: updatedBooking.customer.accessNotes || '',
        updatedAt: new Date().toISOString(),
      });
      return { success: true, booking: updatedBooking };
    } catch (err: any) {
      console.error('Firestore update status failed:', err);
      return {
        success: false,
        booking: updatedBooking,
        error: err?.message || 'Failed to update status in cloud database.',
      };
    }
  }

  return { success: true, booking: updatedBooking };
}

export async function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTimeSlot: string
): Promise<{ success: boolean; booking: Booking | null; error?: string }> {
  const current = getStoredBookings();
  const index = current.findIndex((b) => b.id === bookingId);
  if (index === -1) return { success: false, booking: null, error: 'Booking not found' };

  const updatedBooking: Booking = {
    ...current[index],
    scheduledDate: newDate,
    timeSlot: newTimeSlot,
    status: 'rescheduled',
  };

  current[index] = updatedBooking;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

  if (auth.currentUser) {
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, {
        scheduledDate: newDate,
        timeSlot: newTimeSlot,
        status: 'rescheduled',
        updatedAt: new Date().toISOString(),
      });
      return { success: true, booking: updatedBooking };
    } catch (err: any) {
      console.error('Firestore reschedule failed:', err);
      return {
        success: false,
        booking: updatedBooking,
        error: err?.message || 'Failed to update schedule in cloud database.',
      };
    }
  }

  return { success: true, booking: updatedBooking };
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
