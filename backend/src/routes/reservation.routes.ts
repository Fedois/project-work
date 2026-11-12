import { Router } from "express";
import {
  createReservation,
  getMyReservations,
  checkBookReservation,
  cancelReservation,
} from "../controllers/reservation.controller.js";
import { authenticate, requireUserLogged } from "../middleware/auth.middleware.js";

const router = Router();

// Only authenticated and logged users can access these routes
router.use(authenticate, requireUserLogged);

router.post("/", createReservation);
router.get("/my", getMyReservations);
router.get("/check/:bookId", checkBookReservation);
router.patch("/:id/cancel", cancelReservation);

export default router;
