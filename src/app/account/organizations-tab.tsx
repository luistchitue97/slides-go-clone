import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { createOrgAction, inviteMemberAction, removeMemberAction } from "@/lib/org-actions";

type Props = {
  userId: string;
  organizationId?: string;
};

export async function OrganizationsTab({ userId, organizationId }: Props) {
  if (!organizationId) {
    return <NoOrgState />;
  }

  const workos = getWorkOS();

  const [org, membershipsResult] = await Promise.all([
    workos.organizations.getOrganization(organizationId).catch(() => null),
    workos.userManagement
      .listOrganizationMemberships({ organizationId, limit: 50 })
      .catch(() => null),
  ]);

  const memberships = membershipsResult?.data ?? [];

  // Hydrate each membership with the user's profile
  const members = await Promise.all(
    memberships.map(async (m) => {
      const user = await workos.userManagement.getUser(m.userId).catch(() => null);
      return { membership: m, user };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Org header */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-500">
              Organization
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white light:text-ink-900">
              {org?.name ?? "Unknown organization"}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-ink-400 light:text-ink-500">
              {organizationId}
            </p>
          </div>
        </div>
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
                          <span className="ml-1.5 text-xs text-ink-400 light:text-ink-500">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      {user?.email && displayName !== user.email ? (
                        <p className="truncate text-xs text-ink-400 light:text-ink-500">
                          {user.email}
                        </p>
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
                          className="text-xs text-ink-400 transition hover:text-white light:text-ink-400 light:hover:text-ink-900"
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
        <form action={inviteMemberAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="colleague@company.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-ink-400 focus:border-white/25 focus:outline-none light:border-ink-900/10 light:bg-white light:text-ink-900 light:placeholder:text-ink-400 light:focus:border-ink-900/25"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
          >
            Send invite
          </button>
        </form>
      </div>
    </div>
  );
}

function NoOrgState() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-8 text-center shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <p className="text-xs font-medium uppercase tracking-wider text-accent-500">
          No organization
        </p>
        <h3 className="mt-3 text-lg font-semibold text-white light:text-ink-900">
          You are not part of any organization.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300 light:text-ink-500">
          Create one to manage team members and control who has access to your DeckForge account.
        </p>

        <form action={createOrgAction} className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-ink-400 focus:border-white/25 focus:outline-none light:border-ink-900/10 light:bg-white light:text-ink-900 light:placeholder:text-ink-400 light:focus:border-ink-900/25"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
          >
            Create organization
          </button>
        </form>
      </div>
    </div>
  );
}
