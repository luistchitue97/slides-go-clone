import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Drizzle client over Neon's HTTP driver — works in Node, Edge, and any
 * serverless function on Vercel without connection-pooling concerns.
 *
 * Exposed via a Proxy so the public `db` name stays stable while
 * initialization is deferred until the first query. This keeps the module
 * importable during Next.js build (which evaluates route files before env
 * vars are available) without crashing on a missing DATABASE_URL.
 *
 * For migrations we use a TCP connection (pg) against DATABASE_URL_UNPOOLED;
 * see scripts/db-migrate.mts.
 */

type Db = NeonHttpDatabase<typeof schema>;
let _db: Db | null = null;

function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision Neon from the Vercel marketplace and copy the env values into .env.local.",
    );
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export const db = new Proxy({} as Db, {
  get: (_target, prop, receiver) => Reflect.get(getDb(), prop, receiver),
});

export { schema };
