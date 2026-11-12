import { prisma } from "../lib/prisma.js";
import { ReservationStatus, Category, type Prisma } from "../generated/prisma/client.js";

// Dashboard Stats
export async function getDashboardStats() {
  const now = new Date();

  const [
    totalBooks,
    totalMembers,
    activeLoans,
    overdueLoans,
    pendingReservations,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.loan.count({ where: { returnedAt: null } }),
    prisma.loan.count({ where: { returnedAt: null, dueDate: { lt: now } } }),
    prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
  ]);

  return {
    status: "ok" as const,
    stats: {
      totalBooks,
      totalMembers,
      activeLoans,
      overdueLoans,
      pendingReservations,
    },
  };
}

// Books CRUD
export interface CreateBookDTO {
  title: string;
  author: string;
  category: string;
  isbn?: string | null;
  publicationDate: string | Date;
  quantity: number;
  coverImagePath?: string | null;
  description?: string | null;
  pages?: number | null;
}

export async function adminCreateBook(data: CreateBookDTO) {
  const book = await prisma.book.create({
    data: {
      title: data.title.trim(),
      author: data.author.trim(),
      category: data.category as Category,
      isbn: data.isbn?.trim() || null,
      publicationDate: new Date(data.publicationDate),
      quantity: Number(data.quantity),
      coverImagePath: data.coverImagePath?.trim() || null,
      description: data.description?.trim() || null,
      pages: data.pages ? Number(data.pages) : null,
    },
  });
  return { status: "ok" as const, book };
}

export interface UpdateBookDTO extends Partial<CreateBookDTO> {}

export async function adminUpdateBook(id: string, data: UpdateBookDTO) {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) throw new Error("Libro non trovato");

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.author !== undefined && { author: data.author.trim() }),
      ...(data.category !== undefined && {
        category: data.category as Category,
      }),
      ...(data.isbn !== undefined && { isbn: data.isbn?.trim() || null }),
      ...(data.publicationDate !== undefined && {
        publicationDate: new Date(data.publicationDate),
      }),
      ...(data.quantity !== undefined && { quantity: Number(data.quantity) }),
      ...(data.coverImagePath !== undefined && {
        coverImagePath: data.coverImagePath?.trim() || null,
      }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.pages !== undefined && {
        pages: data.pages ? Number(data.pages) : null,
      }),
    },
  });
  return { status: "ok" as const, book: updated };
}

export async function adminDeleteBook(id: string) {
  const existing = await prisma.book.findUnique({
    where: { id },
    include: {
      loans: { where: { returnedAt: null } },
      reservations: {
        where: {
          status: { in: [ReservationStatus.PENDING, ReservationStatus.APPROVED] },
        },
      },
    },
  });

  if (!existing) throw new Error("Libro non trovato");
  if (existing.loans.length > 0)
    throw new Error("Impossibile eliminare: ci sono prestiti attivi su questo libro");
  if (existing.reservations.length > 0)
    throw new Error("Impossibile eliminare: ci sono prenotazioni attive (PENDING/APPROVED) su questo libro");

  await prisma.book.delete({ where: { id } });
  return { status: "ok" as const };
}

// Reservations Management
export async function adminGetAllReservations(statusFilter?: string) {
  const where: Prisma.ReservationWhereInput = {};

  if (statusFilter) {
    const upper = statusFilter.toUpperCase();
    if (Object.values(ReservationStatus).includes(upper as ReservationStatus)) {
      where.status = upper as ReservationStatus;
    }
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      book: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { status: "ok" as const, reservations };
}

export async function adminUpdateReservationStatus(reservationId: string, newStatus: string) {
  const upper = newStatus.toUpperCase();
  const validStatuses = Object.values(ReservationStatus);
  if (!validStatuses.includes(upper as ReservationStatus)) {
    throw new Error(`Stato non valido: ${newStatus}`);
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) throw new Error("Prenotazione non trovata");

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: upper as ReservationStatus,
      updatedAt: new Date(),
    },
    include: {
      book: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return { status: "ok" as const, reservation: updated };
}

// Loans Management
export interface CreateLoanDTO {
  userId: string;
  bookId: string;
  reservationId: string;
  dueDate: string | Date;
}

export async function adminFulfillReservation(reservationId: string, dueDate: string | Date) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { book: true },
  });

  if (!reservation) throw new Error("Prenotazione non trovata");
  if (reservation.status !== ReservationStatus.APPROVED) {
    throw new Error(
      "Solo le prenotazioni in stato APPROVED possono essere evase"
    );
  }

  // Create the loan, mark reservation as FULFILLED and decrement book available quantity in a single transaction
  const [loan] = await prisma.$transaction([
    prisma.loan.create({
      data: {
        userId: reservation.userId,
        bookId: reservation.bookId,
        dueDate: new Date(dueDate),
        loanDate: new Date(),
      },
      include: {
        book: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.FULFILLED, updatedAt: new Date() },
    }),
    prisma.book.update({
      where: { id: reservation.bookId },
      data: {
        quantity: {
          decrement: reservation.book.quantity > 0 ? 1 : 0,
        },
      },
    }),
  ]);

  return { status: "ok" as const, loan };
}

export async function adminGetAllLoans(activeOnly?: boolean) {
  const where: Prisma.LoanWhereInput = activeOnly
    ? { returnedAt: null }
    : {};

  const loans = await prisma.loan.findMany({
    where,
    include: {
      book: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { loanDate: "desc" },
  });

  return { status: "ok" as const, loans };
}

export async function adminReturnLoan(loanId: string) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error("Prestito non trovato");
  if (loan.returnedAt) throw new Error("Questo prestito è già stato restituito");

  const [updated] = await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: { returnedAt: new Date() },
      include: {
        book: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { quantity: { increment: 1 } },
    }),
    // Delete reservations on the same book and user
    prisma.reservation.deleteMany({
      where: {
        bookId: loan.bookId,
        userId: loan.userId,
      }
    })
  ]);

  return { status: "ok" as const, loan: updated };
}
