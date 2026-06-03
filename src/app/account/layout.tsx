import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { AccountTabs } from "./account-tabs";

export const metadata: Metadata = { title: "Account" };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-ink-300 light:text-ink-500">
          Account
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white light:text-ink-900">
          {fullName}
        </h1>
        <p className="text-ink-200 light:text-ink-600">{user.email}</p>
      </header>

      <AccountTabs />

      {children}
    </section>
  );
}
