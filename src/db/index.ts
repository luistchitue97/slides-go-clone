import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Drizzle client over Neon's HTTP driver — works in Node, Edge, and any
 * serverless function on Vercel without connection pooling concerns. Reads
 * the pooled DATABASE_URL Neon's Vercel integration provides.
 *
 * For migrations we use a TCP connection (pg) against DATABASE_URL_UNPOOLED;
 * see scripts/db-migrate.mts.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision Neon from the Vercel marketplace and copy the env values into .env.local.",
    );
  }
  return url;
}

const sql = neon(getDatabaseUrl());
export const db = drizzle(sql, { schema });
export { schema };
