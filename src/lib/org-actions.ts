"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { withAuth, getWorkOS, switchToOrganization } from "@workos-inc/authkit-nextjs";

export async function createOrgAction(formData: FormData) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const workos = getWorkOS();
  const org = await workos.organizations.createOrganization({ name });
  await workos.userManagement.createOrganizationMembership({
    organizationId: org.id,
    userId: user.id,
    roleSlug: "admin",
  });
  await switchToOrganization(org.id);
  redirect("/account?tab=organizations");
}

export async function inviteMemberAction(formData: FormData) {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  if (!organizationId) return;

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const workos = getWorkOS();
  await workos.userManagement.sendInvitation({
    email,
    organizationId,
    inviterUserId: user.id,
  });
  revalidatePath("/account");
}

export async function removeMemberAction(membershipId: string) {
  await withAuth({ ensureSignedIn: true });
  const workos = getWorkOS();
  await workos.userManagement.deleteOrganizationMembership(membershipId);
  revalidatePath("/account");
}
