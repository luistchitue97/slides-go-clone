"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Settings",      href: "/account/settings" },
  { label: "Organizations", href: "/account/organizations" },
  { label: "Integrations",  href: "/account/integrations" },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-white/10 light:border-ink-900/10">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
              active
                ? "border-white text-white light:border-ink-900 light:text-ink-900"
                : "border-transparent text-ink-300 hover:text-white light:text-ink-500 light:hover:text-ink-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
