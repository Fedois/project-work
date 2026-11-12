import type { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service.js";

// Dashboard Stats
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getDashboardStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// Books Management
export async function createBook(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, author, category, isbn, publicationDate, quantity, coverImagePath, description, pages } = req.body;

    if (!title || !author || !category || !publicationDate || quantity === undefined) {
      res.status(400).json({
        status: "error",
        message: "Campi obbligatori mancanti: title, author, category, publicationDate, quantity",
      });
      return;
    }

    const result = await adminService.adminCreateBook({
      title, author, category, isbn, publicationDate, quantity, coverImagePath, description, pages,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nella creazione del libro" });
  }
}

export async function updateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; 
    const result = await adminService.adminUpdateBook(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nell'aggiornamento del libro" });
  }
}

export async function deleteBook(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await adminService.adminDeleteBook(id as string);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nell'eliminazione del libro" });
  }
}

// Reservations Management
export async function getAllReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const result = await adminService.adminGetAllReservations(status);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateReservationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ status: "error", message: "Campo 'status' obbligatorio" });
      return;
    }

    const result = await adminService.adminUpdateReservationStatus(id as string, status);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nell'aggiornamento della prenotazione" });
  }
}

export async function fulfillReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      res.status(400).json({ status: "error", message: "Campo 'dueDate' obbligatorio per creare il prestito" });
      return;
    }

    const result = await adminService.adminFulfillReservation(id as string, dueDate);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nell'evasione della prenotazione" });
  }
}

// Loans Management
export async function getAllLoans(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.active === "true";
    const result = await adminService.adminGetAllLoans(activeOnly);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function returnLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await adminService.adminReturnLoan(id as string);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error?.message || "Errore nella restituzione del prestito" });
  }
}