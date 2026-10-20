import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend funzionante" });
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});