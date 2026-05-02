import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to use collections");
  }

  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema });
  return db;
}
