"use server";

import { redirect } from "next/navigation";
import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { z } from "zod";
import { SITE_URL } from "@/lib/site";

const IntentSchema = z.enum([
  "sso",
  "dsync",
  "audit_logs",
  "domain_verification",
  "log_streams",
]);

export async function generatePortalLinkAction(formData: FormData) {
  const { organizationId, role } = await withAuth({ ensureSignedIn: true });

  if (!organizationId) redirect("/account/organizations");
  if (role !== "admin") return;

  const parsed = IntentSchema.safeParse(formData.get("intent"));
  if (!parsed.success) return;

  const workos = getWorkOS();
  const { link } = await workos.adminPortal.generateLink({
    intent: parsed.data,
    organization: organizationId,
    returnUrl: `${SITE_URL}/account/security`,
    successUrl: `${SITE_URL}/account/security`,
  });

  redirect(link);
}
