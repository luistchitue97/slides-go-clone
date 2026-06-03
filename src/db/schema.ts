import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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

/**
 * One row per Stripe subscription. The webhook is the only writer:
 *   - checkout.session.completed → first insert (status from Stripe)
 *   - customer.subscription.updated/deleted → status + period end refresh
 *
 * Access is granted while `status` is active/trialing (see lib/entitlements).
 * stripe_subscription_id is unique so repeated webhook deliveries upsert
 * the same row rather than duplicating it.
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  // Stripe status: active | trialing | past_due | canceled | unpaid | incomplete | …
  status: text("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Per-user, per-template configuration store. Shared across all template
 * subdomains so a customization made on one host follows the user everywhere.
 * Composite PK (user_id, template_id) gives upsert-by-pair semantics.
 */
export const templateCustomizations = pgTable(
  "template_customizations",
  {
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    templateId: text("template_id").notNull(),
    config: jsonb("config").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.templateId] }),
  }),
);

/**
 * A third-party account an org has connected (e.g. a Stripe account via Stripe
 * Connect OAuth). One row per (org, provider, external account). We store only
 * the connected account id (`acct_…`) — reads go through the platform key with
 * the `{ stripeAccount }` option, so no tokens/secrets are persisted.
 *
 * organizationId and connectedByUserId are WorkOS ids stored as plain text
 * (WorkOS is the source of truth — same pattern as elsewhere; no local FK).
 */
export const integrationAccounts = pgTable(
  "integration_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id").notNull(),
    provider: text("provider").notNull(),
    externalAccountId: text("external_account_id").notNull(),
    displayName: text("display_name"),
    status: text("status").notNull().default("connected"),
    connectedByUserId: text("connected_by_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueAccount: unique().on(t.organizationId, t.provider, t.externalAccountId),
  }),
);

/**
 * Which connected account a given report uses. Per (org, report, provider) so
 * different reports can point at different accounts. Deleting the account
 * cascades these away.
 */
export const reportConnections = pgTable(
  "report_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id").notNull(),
    reportKey: text("report_key").notNull(),
    provider: text("provider").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => integrationAccounts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueReport: unique().on(t.organizationId, t.reportKey, t.provider),
  }),
);

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type TemplateCustomization = typeof templateCustomizations.$inferSelect;
export type NewTemplateCustomization = typeof templateCustomizations.$inferInsert;
export type IntegrationAccount = typeof integrationAccounts.$inferSelect;
export type NewIntegrationAccount = typeof integrationAccounts.$inferInsert;
export type ReportConnection = typeof reportConnections.$inferSelect;
export type NewReportConnection = typeof reportConnections.$inferInsert;
