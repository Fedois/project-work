import "dotenv/config";
import express from "express";
import bookRoutes from "./routes/book.routes.js";
import cors from "cors";

// Express app creation
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);

// Server startup
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});