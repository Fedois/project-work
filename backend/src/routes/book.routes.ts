import { Router } from "express";
import { getBooks, getBookById, addFeedback } from "../controllers/book.controller.js";

const router = Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/new-feedback", addFeedback);

export default router;