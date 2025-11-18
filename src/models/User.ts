// src/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  passwordHash: { type: String, required: true },
  calendlyUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", UserSchema);
