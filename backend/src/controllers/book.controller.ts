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