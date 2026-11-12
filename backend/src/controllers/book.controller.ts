import type { Request, Response, NextFunction } from "express";
import * as bookService from "../services/book.service.js";

export async function getBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookService.getBooks(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBookById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookService.getBookById(req.params.id as string);

    if (!result) {
      res.status(404).json({status: "error", message: "Libro non trovato"});
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function addFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({ status: "error", message: "Utente non autenticato" });
    }

    const { bookId, rating, comment, title } = req.body;

    if (!bookId || rating === undefined || rating === null) {
      return res.status(400).json({ status: "error", message: "ID libro e valutazione sono obbligatori" });
    }

    const result = await bookService.addFeedback({
      bookId,
      userId,
      rating: Number(rating),
      comment,
      title,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}