import { apiFetch } from '../lib/api';
import type { Reservation, MyBooksData } from '../types/reservations';

// send a reservation request for a book (create or update to PENDING)
export async function createReservation(bookId: string): Promise<Reservation> {
  const data = await apiFetch('/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId }),
  });
  return data.reservation;
}

// get user's reservations and loans
export async function getMyReservations(): Promise<MyBooksData> {
  const data = await apiFetch('/api/reservations/my', {
    method: 'GET',
  });
  return {
    reservations: data.reservations || [],
    loans: data.loans || [],
  };
}

// check if user has a reservation for a book
export async function checkBookReservation(bookId: string): Promise<Reservation | null> {
  try {
    const data = await apiFetch(`/api/reservations/check/${bookId}`, {
      method: 'GET',
    });
    return data.reservation || null;
  } catch {
    return null;
  }
}

// cancel user reservation in state PENDING or APPROVED
export async function cancelReservation(reservationId: string): Promise<Reservation> {
  const data = await apiFetch(`/api/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
  });
  return data.reservation;
}
