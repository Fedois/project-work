import type { Book } from './books';

export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'FULFILLED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Reservation {
  id: string;
  status: ReservationStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  bookId: string;
  book: Book;
}

export interface Loan {
  id: string;
  loanDate: string | Date;
  dueDate: string | Date;
  returnedAt?: string | Date | null;
  userId: string;
  bookId: string;
  book: Book;
  createdAt: string | Date;
}

export interface MyBooksData {
  reservations: Reservation[];
  loans: Loan[];
}

export interface UnifiedItem {
  id: string;
  type: 'reservation' | 'loan';
  book: Reservation['book'];
  status: ReservationStatus | 'RETURNED';
  createdAt: string | Date;
  dateLabel: string;
  dueDate?: string | Date;
  returnedAt?: string | Date | null;
  rawReservation?: Reservation;
  rawLoan?: Loan;
}

export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  {
    label: string;
    description: string;
    variant: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  }
> = {
  PENDING: {
    label: 'In attesa',
    description: 'Richiesta inviata. In attesa di approvazione da parte del bibliotecario.',
    variant: 'pending',
  },
  APPROVED: {
    label: 'Approvata',
    description: 'La prenotazione è pronta! Puoi ritirare il libro al desk.',
    variant: 'approved',
  },
  FULFILLED: {
    label: 'In prestito',
    description: 'Libro ritirato e attualmente in corso di lettura.',
    variant: 'fulfilled',
  },
  REJECTED: {
    label: 'Rifiutata',
    description: 'Richiesta non approvata dal bibliotecario.',
    variant: 'rejected',
  },
  CANCELLED: {
    label: 'Annullata',
    description: 'Prenotazione annullata.',
    variant: 'cancelled',
  },
};
