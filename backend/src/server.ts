import express from "express";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const mex = await prisma.book.findMany();
  res.json({ status: "ok", message: "Backend funzionante", mex });
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});