import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Support both SQLite and PostgreSQL
const isSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isSQLite ? "sqlite" : "postgresql",
  dbCredentials: isSQLite 
    ? { url: process.env.DATABASE_URL.replace('sqlite:', '') }
    : { url: process.env.DATABASE_URL },
});
