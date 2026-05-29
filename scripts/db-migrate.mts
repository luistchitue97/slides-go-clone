// Apply any pending Drizzle migrations against the current DATABASE_URL.
// Uses pg (TCP) on the non-pooled connection so DDL is safe.
//
// Run with: pnpm db:migrate
//
// Reads env from .env.local automatically when invoked locally.

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const db = drizzle(pool);

try {
  console.log("Applying migrations…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Done.");
} finally {
  await pool.end();
}
