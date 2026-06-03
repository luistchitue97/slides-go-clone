import { z } from "zod";

export const CreateOrgSchema = z.object({
  name: z
    .string()
    .min(1, "Give your organization a name")
    .max(100, "Keep the name under 100 characters")
    .trim(),
});

export const InviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Enter the email address to invite")
    .email("That doesn't look like a valid email address"),
});

export const SwitchOrgSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

/** Field-level errors keyed by field name. */
export type FieldErrors = Record<string, string>;

export type OrgFormState = {
  errors?: FieldErrors;
  success?: boolean;
} | null;

/** Collapse a Zod error into a flat { fieldName: firstMessage } map. */
export function zodErrors(error: z.ZodError): FieldErrors {
  return Object.fromEntries(
    error.issues.map((i) => [String(i.path[0] ?? "_"), i.message]),
  );
}
