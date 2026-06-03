import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { OrganizationsTab } from "../organizations-tab";

export const metadata: Metadata = { title: "Organizations" };

export default async function OrganizationsPage() {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  return <OrganizationsTab userId={user.id} organizationId={organizationId} />;
}
