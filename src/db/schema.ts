import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Application-side mirror of a WorkOS user. WorkOS remains the source of
 * truth for identity; this table exists only so that purchases (and any
 * other future per-user state) have a FK to point at.
 *
 * The PK is the WorkOS user id, so no extra mapping is needed.
 */
export const appUsers = pgTable("app_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * One row per successful Stripe Checkout Session. Granted exclusively by the
 * /api/stripe/webhook handler on checkout.session.completed — never by the
 * post-payment redirect. The stripe_session_id is unique so duplicate webhook
 * deliveries become no-ops.
 *
 * `kind` is open-ended for future expansion (e.g. "template:north-star-pitch")
 * but for now is always "all_access".
 */
export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
