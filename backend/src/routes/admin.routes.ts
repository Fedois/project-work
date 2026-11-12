import { Router } from "express";
import { authenticate, requireLibrarian } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  createBook,
  updateBook,
  deleteBook,
  getAllReservations,
  updateReservationStatus,
  fulfillReservation,
  getAllLoans,
  returnLoan,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication + LIBRARIAN/ADMIN role
router.use(authenticate, requireLibrarian);

// Stats
router.get("/stats", getDashboardStats);

// Books management
router.post("/books", createBook);
router.patch("/books/:id", updateBook);
router.delete("/books/:id", deleteBook);

// Reservations management
router.get("/reservations", getAllReservations);
router.patch("/reservations/:id/status", updateReservationStatus);
router.post("/reservations/:id/fulfill", fulfillReservation);

// Loans management
router.get("/loans", getAllLoans);
router.patch("/loans/:id/return", returnLoan);

export default router;

