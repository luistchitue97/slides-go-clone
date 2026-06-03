import type { Metadata } from "next";
import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { generatePortalLinkAction } from "@/lib/security-actions";
import { switchOrgAction } from "@/lib/org-actions";

export const metadata: Metadata = { title: "Security" };

const cardClass =
  "rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white";

export default async function SecurityPage() {
  const { user, organizationId, role } = await withAuth({ ensureSignedIn: true });

  const workos = getWorkOS();

  // Fetch all orgs this user belongs to for the context switcher
  const userMembershipsResult = await workos.userManagement
    .listOrganizationMemberships({ userId: user.id, limit: 20 })
    .catch(() => null);

  const userOrgs = await Promise.all(
    (userMembershipsResult?.data ?? []).map((m) =>
      workos.organizations.getOrganization(m.organizationId).catch(() => null),
    ),
  );

  if (!organizationId) {
    return (
      <div className="flex flex-col gap-6">
        <NoOrgPrompt userOrgs={userOrgs.filter(Boolean)} />
      </div>
    );
  }

  const isAdmin = role === "admin";

  const [org, connectionsResult, directoriesResult] = await Promise.all([
    workos.organizations.getOrganization(organizationId).catch(() => null),
    workos.sso.listConnections({ organizationId, limit: 5 }).catch(() => null),
    workos.directorySync.listDirectories({ organizationId, limit: 5 }).catch(() => null),
  ]);

  const ssoConnections = connectionsResult?.data ?? [];
  const directories = directoriesResult?.data ?? [];

  const ssoActive = ssoConnections.some((c) => c.state === "active");
  const dsyncActive = directories.some((d) => d.state === "active");

  return (
    <div className="flex flex-col gap-6">
      {/* Org context selector — always visible so admin knows what they're configuring */}
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-white light:text-ink-900">
            Configuring security for
          </h3>
        </div>

        <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
          {userOrgs.filter(Boolean).map((o) => {
            const isCurrent = o!.id === organizationId;
            return (
              <li
                key={o!.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {isCurrent ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5 shrink-0 text-accent-500" aria-hidden>
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${isCurrent ? "text-white light:text-ink-900" : "text-ink-300 light:text-ink-500"}`}>
                      {o!.name}
                    </p>
                    {isCurrent && !isAdmin ? (
                      <p className="text-xs text-amber-400">
                        You are not an admin of this organisation
                      </p>
                    ) : null}
                  </div>
                </div>

                {isCurrent ? (
                  <span className="shrink-0 text-xs text-ink-400 light:text-ink-500">Selected</span>
                ) : (
                  <form action={switchOrgAction}>
                    <input type="hidden" name="organizationId" value={o!.id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
                    >
                      Switch to this org
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Non-admin warning */}
      {!isAdmin ? (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          You need admin privileges in <strong>{org?.name ?? "this organisation"}</strong> to
          configure security settings. Switch to an org where you are admin, or ask your org admin
          to make changes.
        </div>
      ) : null}

      {/* Feature cards */}
      <div className="flex flex-col gap-4">
        <FeatureCard
          icon={<SsoIcon />}
          title="Single Sign-On"
          description="Let members log in with your company identity provider — Okta, Azure AD, Google Workspace, and more via SAML 2.0 or OIDC."
          status={ssoActive ? "active" : ssoConnections.length > 0 ? "pending" : "unconfigured"}
          intent="sso"
          disabled={!isAdmin}
        />

        <FeatureCard
          icon={<DsyncIcon />}
          title="Directory Sync"
          description="Automatically provision and deprovision members when they join or leave your organisation via SCIM. Works with Okta, Azure AD, and more."
          status={dsyncActive ? "active" : directories.length > 0 ? "pending" : "unconfigured"}
          intent="dsync"
          disabled={!isAdmin}
        />

        <FeatureCard
          icon={<DomainIcon />}
          title="Domain Verification"
          description="Verify your organisation's email domains so WorkOS can automatically match users to your organisation on sign-up."
          status="unconfigured"
          intent="domain_verification"
          disabled={!isAdmin}
        />

        <FeatureCard
          icon={<AuditIcon />}
          title="Audit Logs"
          description="View a full tamper-proof log of authentication and admin events across your organisation — who signed in, when, and from where."
          status="unconfigured"
          intent="audit_logs"
          disabled={!isAdmin}
        />

        <FeatureCard
          icon={<StreamIcon />}
          title="Log Streams"
          description="Forward audit events to your SIEM — Splunk, Datadog, AWS S3, and more. Keep your security stack in sync automatically."
          status="unconfigured"
          intent="log_streams"
          disabled={!isAdmin}
        />
      </div>
    </div>
  );
}

type FeatureStatus = "active" | "pending" | "unconfigured";

function FeatureCard({
  icon,
  title,
  description,
  status,
  intent,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: FeatureStatus;
  intent: string;
  disabled: boolean;
}) {
  const buttonLabel =
    status === "active" ? "Manage" : status === "pending" ? "Continue setup" : "Configure";

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-ink-300 light:border-ink-900/10 light:bg-ink-50 light:text-ink-500">
            {icon}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm font-semibold text-white light:text-ink-900">{title}</h3>
              {status === "active" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              )}
              {status === "pending" && (
                <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  Setup in progress
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink-400 light:text-ink-500">
              {description}
            </p>
          </div>
        </div>

        <form action={generatePortalLinkAction} className="shrink-0">
          <input type="hidden" name="intent" value={intent} />
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
          >
            {buttonLabel} →
          </button>
        </form>
      </div>
    </div>
  );
}

function NoOrgPrompt({ userOrgs }: { userOrgs: Array<{ id: string; name: string } | null> }) {
  if (userOrgs.length > 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <p className="text-sm font-medium text-white light:text-ink-900">
          Select an organisation to configure security for
        </p>
        <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
          {userOrgs.filter(Boolean).map((o) => (
            <li key={o!.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-ink-300 light:text-ink-600">{o!.name}</span>
              <form action={switchOrgAction}>
                <input type="hidden" name="organizationId" value={o!.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
                >
                  Select
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
      <p className="text-sm text-ink-400 light:text-ink-500">
        You need to be part of an organisation to manage security settings.{" "}
        <a href="/account/organizations" className="text-white underline-offset-4 hover:underline light:text-ink-900">
          Create or join one →
        </a>
      </p>
    </div>
  );
}

function SsoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <rect x="3" y="8" width="14" height="9" rx="2" />
      <path d="M7 8V6a3 3 0 0 1 6 0v2" />
      <circle cx="10" cy="12.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DsyncIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <circle cx="10" cy="5" r="2" />
      <circle cx="4" cy="15" r="2" />
      <circle cx="16" cy="15" r="2" />
      <path d="M10 7v3M10 10l-4.5 3M10 10l4.5 3" />
    </svg>
  );
}

function DomainIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 3c-2 2.5-2 11.5 0 14M10 3c2 2.5 2 11.5 0 14M3 10h14" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <path d="M4 4h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M7 8h6M7 11h4" />
    </svg>
  );
}

function StreamIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <path d="M3 10h4l3-6 3 12 3-6h1" />
    </svg>
  );
}
