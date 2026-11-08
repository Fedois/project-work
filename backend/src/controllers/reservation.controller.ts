import type { Request, Response, NextFunction } from "express";
import * as reservationService from "../services/reservation.service.js";
import * as authService from "../services/auth.service.js";

export async function createReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await authService.getCurrentUserFromReq(req);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Devi aver effettuato l'accesso per prenotare un libro",
      });
      return;
    }

    const { bookId } = req.body;

    if (!bookId || typeof bookId !== "string") {
      res.status(400).json({
        status: "error",
        message: "Identificativo del libro non valido o mancante",
      });
      return;
    }

    const result = await reservationService.createOrUpdateReservation(userId, bookId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error?.message || "Errore durante la creazione della prenotazione",
    });
  }
}

export async function getMyReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await authService.getCurrentUserFromReq(req);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Autenticazione richiesta",
      });
      return;
    }

    const result = await reservationService.getUserReservationsAndLoans(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkBookReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await authService.getCurrentUserFromReq(req);

    if (!userId) {
      res.json({
        status: "ok",
        reservation: null,
      });
      return;
    }

    const paramBookId = req.params.bookId;
    const bookId = Array.isArray(paramBookId) ? paramBookId[0] : paramBookId;

    if (!bookId) {
      res.status(400).json({
        status: "error",
        message: "ID libro mancante",
      });
      return;
    }

    const result = await reservationService.getReservationForBook(userId, bookId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function cancelReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await authService.getCurrentUserFromReq(req);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Autenticazione richiesta",
      });
      return;
    }

    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;

    if (!id) {
      res.status(400).json({
        status: "error",
        message: "ID prenotazione mancante",
      });
      return;
    }

    const result = await reservationService.cancelUserReservation(userId, id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error?.message || "Errore durante l'annullamento della prenotazione",
    });
  }
}
