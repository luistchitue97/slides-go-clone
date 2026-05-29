import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local secrets so drizzle-kit can connect when run from the CLI.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations use the direct (non-pooled) connection so DDL doesn't choke
  // on pgbouncer. Falls back to DATABASE_URL for environments that only
  // expose one connection string.
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
