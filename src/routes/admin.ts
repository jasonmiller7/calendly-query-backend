// src/routes/admin.ts
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { User } from "../models/User";

const router = express.Router();

router.post("/calendly-url", requireAuth, requireAdmin, async (req, res) => {
  const { calendlyUrl } = req.body;
  if (!calendlyUrl) return res.status(400).json({ error: "calendlyUrl required" });
  const user = await User.findById((req as any).auth.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.calendlyUrl = calendlyUrl;
  await user.save();
  res.json({ success: true, calendlyUrl: user.calendlyUrl });
});

export default router;
