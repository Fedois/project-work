import { prisma } from "../lib/prisma.js";
import { ReservationStatus } from "../generated/prisma/client.js";

// create or update a reservation
export async function createOrUpdateReservation(userId: string, bookId: string) {
  // verify if book exist
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Libro non trovato");
  }

  // verify if there is already a reservation between this user and book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      userId,
      bookId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let reservation;

  if (existingReservation) {
    // update the reservation status to PENDING
    reservation = await prisma.reservation.update({
      where: { id: existingReservation.id },
      data: {
        status: ReservationStatus.PENDING,
        updatedAt: new Date(),
      },
      include: {
        book: true,
      },
    });
  } else {
    // create a new reservation setting reservationStatus to PENDING
    reservation = await prisma.reservation.create({
      data: {
        userId,
        bookId,
        status: ReservationStatus.PENDING,
      },
      include: {
        book: true,
      },
    });
  }

  return { status: "ok" as const, reservation };
}

// get user reservations and loans
export async function getUserReservationsAndLoans(userId: string) {
  const [reservations, loans] = await Promise.all([
    prisma.reservation.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        loanDate: "desc",
      },
    }),
  ]);

  return { status: "ok" as const, reservations, loans };
}

// get user's reservation for a specific book
export async function getReservationForBook(userId: string, bookId: string) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      userId,
      bookId,
    },
    include: {
      book: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { status: "ok" as const, reservation: reservation || null };
}

// cancel user reservation status PENDING or APPROVED
export async function cancelUserReservation(userId: string, reservationId: string) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      userId,
    },
  });

  if (!reservation) {
    throw new Error("Prenotazione non trovata");
  }

  if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.APPROVED) {
    throw new Error("Impossibile annullare una prenotazione già evasa o conclusa");
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: ReservationStatus.CANCELLED,
      updatedAt: new Date(),
    },
    include: {
      book: true,
    },
  });

  return { status: "ok" as const, reservation: updated };
}
