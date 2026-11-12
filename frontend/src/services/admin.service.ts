import { apiFetch } from '../lib/api';
import type { Book } from '../types/books';
import type { Reservation, Loan } from '../types/reservations';

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  pendingReservations: number;
}

export interface AdminReservation extends Reservation {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AdminLoan extends Loan {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BookFormData {
  title: string;
  author: string;
  category: string;
  isbn?: string;
  publicationDate: string;
  quantity: number;
  coverImagePath?: string;
  description?: string;
  pages?: number | null;
}

// Stats Management
export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await apiFetch('/api/admin/stats');
  return data.stats;
}

// Books Management
export async function adminCreateBook(book: BookFormData): Promise<Book> {
  const data = await apiFetch('/api/admin/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  return data.book;
}

export async function adminUpdateBook(id: string, book: Partial<BookFormData>): Promise<Book> {
  const data = await apiFetch(`/api/admin/books/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  return data.book;
}

export async function adminDeleteBook(id: string): Promise<void> {
  await apiFetch(`/api/admin/books/${id}`, { method: 'DELETE' });
}

// Reservations Management
export async function adminGetReservations(status?: string): Promise<AdminReservation[]> {
  const url = status ? `/api/admin/reservations?status=${status}` : '/api/admin/reservations';
  const data = await apiFetch(url);
  return data.reservations;
}

export async function adminUpdateReservationStatus(
  id: string,
  status: string
): Promise<AdminReservation> {
  const data = await apiFetch(`/api/admin/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return data.reservation;
}

export async function adminFulfillReservation(
  reservationId: string,
  dueDate: string
): Promise<AdminLoan> {
  const data = await apiFetch(`/api/admin/reservations/${reservationId}/fulfill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dueDate }),
  });
  return data.loan;
}

// Loans Management
export async function adminGetLoans(activeOnly?: boolean): Promise<AdminLoan[]> {
  const url = activeOnly ? '/api/admin/loans?active=true' : '/api/admin/loans';
  const data = await apiFetch(url);
  return data.loans;
}

export async function adminReturnLoan(loanId: string): Promise<AdminLoan> {
  const data = await apiFetch(`/api/admin/loans/${loanId}/return`, {
    method: 'PATCH',
  });
  return data.loan;
}

