"use client";

import { useActionState, useState } from "react";
import { InviteMemberSchema, zodErrors, type FieldErrors } from "@/lib/schemas/org";
import { inviteMemberAction } from "@/lib/org-actions";
import { FieldError, inputBorder } from "@/components/ui/field-error";

export function InviteForm() {
  const [state, action, isPending] = useActionState(inviteMemberAction, null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const emailError = clientErrors.email ?? state?.errors?.email;
  const globalError = clientErrors._ ?? state?.errors?._;
  const success = state?.success === true;

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const result = InviteMemberSchema.safeParse({ email: data.get("email") });
    if (!result.success) {
      e.preventDefault();
      setClientErrors(zodErrors(result.error));
    } else {
      setClientErrors({});
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={action} onSubmit={validate} className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            type="email"
            name="email"
            required
            placeholder="colleague@company.com"
            onChange={() => setClientErrors((p) => { const n = { ...p }; delete n.email; return n; })}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "invite-email-error" : undefined}
            className={`w-full rounded-lg border bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-ink-400 focus:outline-none light:bg-white light:text-ink-900 light:placeholder:text-ink-400 ${inputBorder(Boolean(emailError))}`}
          />
          <FieldError message={emailError} id="invite-email-error" />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 disabled:opacity-50 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
        >
          {isPending ? "Sending…" : "Send invite"}
        </button>
      </form>

      <FieldError message={globalError} />

      {success ? (
        <p role="status" className="flex items-center gap-1.5 text-xs text-emerald-400">
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5 shrink-0" aria-hidden>
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
          </svg>
          Invitation sent successfully.
        </p>
      ) : null}
    </div>
  );
}
