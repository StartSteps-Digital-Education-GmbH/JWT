import dotenv from "dotenv";

dotenv.config();

export const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key-here";
export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/jwt-auth-example";
