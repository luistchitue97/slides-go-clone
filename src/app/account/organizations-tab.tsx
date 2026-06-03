import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { removeMemberAction, switchOrgAction } from "@/lib/org-actions";
import { CreateOrgDialog } from "./create-org-dialog";
import { CreateOrgForm } from "./create-org-form";
import { InviteForm } from "./invite-form";

type Props = {
  userId: string;
  organizationId?: string;
};

export async function OrganizationsTab({ userId, organizationId }: Props) {
  const workos = getWorkOS();

  // All orgs this user belongs to (for the switcher)
  const userMembershipsResult = await workos.userManagement
    .listOrganizationMemberships({ userId, limit: 20 })
    .catch(() => null);

  const userOrgs = await Promise.all(
    (userMembershipsResult?.data ?? []).map((m) =>
      workos.organizations.getOrganization(m.organizationId).catch(() => null),
    ),
  );

  if (!organizationId) {
    return <NoOrgState userOrgs={userOrgs.filter(Boolean)} />;
  }

  const [org, membershipsResult] = await Promise.all([
    workos.organizations.getOrganization(organizationId).catch(() => null),
    workos.userManagement
      .listOrganizationMemberships({ organizationId, limit: 50 })
      .catch(() => null),
  ]);

  const memberships = membershipsResult?.data ?? [];

  const members = await Promise.all(
    memberships.map(async (m) => {
      const user = await workos.userManagement.getUser(m.userId).catch(() => null);
      return { membership: m, user };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Org switcher */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-white light:text-ink-900">Organizations</h3>
          <CreateOrgDialog />
        </div>

        <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
          {userOrgs.filter(Boolean).map((o) => {
            const isCurrent = o!.id === organizationId;
            const switchAction = switchOrgAction.bind(null);
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
                    <span className="size-3.5 shrink-0" aria-hidden />
                  )}
                  <span className={`truncate text-sm font-medium ${isCurrent ? "text-white light:text-ink-900" : "text-ink-300 light:text-ink-500"}`}>
                    {o!.name}
                  </span>
                </div>

                {isCurrent ? (
                  <span className="shrink-0 text-xs text-ink-400 light:text-ink-500">Current</span>
                ) : (
                  <form action={switchAction}>
                    <input type="hidden" name="organizationId" value={o!.id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
                    >
                      Switch
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Org identity */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <p className="text-xs font-medium uppercase tracking-wider text-accent-500">
          Current organization
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white light:text-ink-900">
          {org?.name ?? "Unknown organization"}
        </h2>
        <p className="mt-0.5 font-mono text-xs text-ink-400 light:text-ink-500">{organizationId}</p>
      </div>

      {/* Members */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <h3 className="text-base font-semibold text-white light:text-ink-900">
          Team members
          <span className="ml-2 text-sm font-normal text-ink-400 light:text-ink-500">
            {members.length}
          </span>
        </h3>

        {members.length === 0 ? (
          <p className="mt-4 text-sm text-ink-400 light:text-ink-500">No members yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
            {members.map(({ membership, user }) => {
              const displayName =
                [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                user?.email ||
                "Unknown user";
              const isCurrentUser = membership.userId === userId;
              const removeAction = removeMemberAction.bind(null, membership.id);

              return (
                <li
                  key={membership.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700/40 text-xs font-semibold text-brand-200 light:bg-brand-100 light:text-brand-700">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white light:text-ink-900">
                        {displayName}
                        {isCurrentUser ? (
                          <span className="ml-1.5 text-xs text-ink-400 light:text-ink-500">(you)</span>
                        ) : null}
                      </p>
                      {user?.email && displayName !== user.email ? (
                        <p className="truncate text-xs text-ink-400 light:text-ink-500">{user.email}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium capitalize text-ink-300 light:border-ink-900/10 light:bg-ink-100 light:text-ink-500">
                      {membership.role?.slug ?? "member"}
                    </span>
                    {!isCurrentUser ? (
                      <form action={removeAction}>
                        <button
                          type="submit"
                          className="text-xs text-ink-400 transition hover:text-white light:hover:text-ink-900"
                        >
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Invite */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <h3 className="text-base font-semibold text-white light:text-ink-900">Invite a member</h3>
        <p className="mt-0.5 text-sm text-ink-400 light:text-ink-500">
          They will receive an email invitation to join your organization.
        </p>
        <div className="mt-4">
          <InviteForm />
        </div>
      </div>
    </div>
  );
}

type Org = { id: string; name: string } | null;

function NoOrgState({ userOrgs }: { userOrgs: Org[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Show any orgs the user can switch into, even without a current session org */}
      {userOrgs.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-white light:text-ink-900">Organizations</h3>
            <CreateOrgDialog />
          </div>
          <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
            {userOrgs.filter(Boolean).map((o) => (
              <li key={o!.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="truncate text-sm font-medium text-ink-300 light:text-ink-500">{o!.name}</span>
                <form action={switchOrgAction}>
                  <input type="hidden" name="organizationId" value={o!.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
                  >
                    Switch
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-8 text-center shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <p className="text-xs font-medium uppercase tracking-wider text-accent-500">No organization</p>
        <h3 className="mt-3 text-lg font-semibold text-white light:text-ink-900">
          You are not part of any organization.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300 light:text-ink-500">
          Create one to manage team members and control who has access to your DeckForge account.
        </p>
        <CreateOrgForm />
      </div>
    </div>
  );
}
