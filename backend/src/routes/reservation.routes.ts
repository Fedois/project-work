import { Router } from "express";
import {
  createReservation,
  getMyReservations,
  checkBookReservation,
  cancelReservation,
} from "../controllers/reservation.controller.js";

const router = Router();

router.post("/", createReservation);
router.get("/my", getMyReservations);
router.get("/check/:bookId", checkBookReservation);
router.patch("/:id/cancel", cancelReservation);

export default router;
