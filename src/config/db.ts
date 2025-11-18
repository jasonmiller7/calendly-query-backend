// src/config/db.ts
import mongoose from "mongoose";

export async function connectDb(uri: string) {
  await mongoose.connect(uri);
  console.log("Mongo connected");
}
