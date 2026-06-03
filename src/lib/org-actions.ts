"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { withAuth, getWorkOS, switchToOrganization } from "@workos-inc/authkit-nextjs";
import {
  CreateOrgSchema,
  InviteMemberSchema,
  SwitchOrgSchema,
  zodErrors,
  type OrgFormState,
} from "@/lib/schemas/org";

export async function createOrgAction(
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const { user } = await withAuth({ ensureSignedIn: true });

  const parsed = CreateOrgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { errors: zodErrors(parsed.error) };

  const workos = getWorkOS();
  try {
    const org = await workos.organizations.createOrganization({ name: parsed.data.name });
    await workos.userManagement.createOrganizationMembership({
      organizationId: org.id,
      userId: user.id,
      roleSlug: "admin",
    });
    await switchToOrganization(org.id);
  } catch {
    return { errors: { _: "Could not create the organization — please try again." } };
  }

  redirect("/account/organizations");
}

export async function inviteMemberAction(
  _prevState: OrgFormState,
  formData: FormData,
): Promise<OrgFormState> {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  if (!organizationId) {
    return { errors: { _: "No active organization. Switch to one first." } };
  }

  const parsed = InviteMemberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { errors: zodErrors(parsed.error) };

  const workos = getWorkOS();
  try {
    await workos.userManagement.sendInvitation({
      email: parsed.data.email,
      organizationId,
      inviterUserId: user.id,
    });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : "";
    const userFacing = message.toLowerCase().includes("already")
      ? "Someone with that email is already a member or has a pending invite."
      : "Could not send the invitation — please try again.";
    return { errors: { email: userFacing } };
  }

  revalidatePath("/account");
  return { success: true };
}

export async function switchOrgAction(formData: FormData) {
  const parsed = SwitchOrgSchema.safeParse({ organizationId: formData.get("organizationId") });
  if (!parsed.success) return;
  await withAuth({ ensureSignedIn: true });
  await switchToOrganization(parsed.data.organizationId);
  redirect("/account/organizations");
}

export async function removeMemberAction(membershipId: string) {
  const parsed = SwitchOrgSchema.shape.organizationId.safeParse(membershipId);
  if (!parsed.success) return;
  await withAuth({ ensureSignedIn: true });
  const workos = getWorkOS();
  await workos.userManagement.deleteOrganizationMembership(parsed.data);
  revalidatePath("/account");
}
