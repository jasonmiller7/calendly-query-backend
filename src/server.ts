// src/server.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDb } from "./config/db";

import queryRoutes from "./routes/queries";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/queries", queryRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDb(process.env.MONGO_URI!);
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})();
