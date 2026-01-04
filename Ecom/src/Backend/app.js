// backend/app.js
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";  // ← MUST HAVE THIS

const app = express();

app.use(cors());                // ← MUST HAVE
app.use(express.json());        // ← MUST HAVE (reads req.body)

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);  // ← MUST HAVE THIS

export default app;
