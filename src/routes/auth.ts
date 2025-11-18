// src/routes/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role = "user", calendlyUrl } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      role,
      passwordHash,
      calendlyUrl: role === "admin" ? calendlyUrl : null,
    });

    if (!process.env.JWT_SECRET) {
      console.error("[auth.register] JWT_SECRET is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // ✅ Issue token immediately after registration
    const token = jwt.sign(
      { sub: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        calendlyUrl: user.calendlyUrl,
      },
    });
  } catch (err) {
    console.error("[auth.register] unexpected error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    console.log("[auth.login] login attempt for:", { identifier: username });

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("[auth.login] JWT_SECRET is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign({ sub: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error("[auth.login] unexpected error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}); 
export default router;
