import { Router } from "express";
import { getBooks, getBookById, addFeedback } from "../controllers/book.controller.js";
import { authenticate, requireUserLogged } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/new-feedback", authenticate, requireUserLogged, addFeedback);

export default router;