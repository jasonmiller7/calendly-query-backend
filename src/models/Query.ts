// src/models/Query.ts
import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  preferredTimes: { type: [String], default: [] }, // ISO strings
  message: { type: String, default: "" },
  status: { type: String, enum: ["pending", "scheduled", "rejected"], default: "pending" },
  scheduledEventUri: { type: String, default: null },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Query = mongoose.model("Query", QuerySchema);
