// src/routes/queries.ts
import express from "express";
import { Query } from "../models/Query";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { clientName, clientEmail, preferredTimes = [], message = "" } = req.body;
    if (!clientName || !clientEmail) return res.status(400).json({ error: "clientName and clientEmail required" });
    const q = await Query.create({ clientName, clientEmail, preferredTimes, message });
    res.json({ success: true, query: q });
  } catch (err) {
    console.error("POST /queries/create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pending", requireAuth, requireAdmin, async (_req, res) => {
  const queries = await Query.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json({ collection: queries });
});

router.post("/schedule/:id", requireAuth, requireAdmin, async (req, res) => {
  const { calendlyEventUri } = req.body;
  const q = await Query.findById(req.params.id);
  if (!q) return res.status(404).json({ error: "Query not found" });
  q.status = "scheduled";
  q.scheduledEventUri = calendlyEventUri || null;
  q.scheduledBy = (req as any).auth.sub;
  await q.save();
  res.json({ success: true, query: q });
});

router.post("/reject/:id", requireAuth, requireAdmin, async (req, res) => {
  const q = await Query.findById(req.params.id);
  if (!q) return res.status(404).json({ error: "Query not found" });
  q.status = "rejected";
  await q.save();
  res.json({ success: true, query: q });
});

export default router;
