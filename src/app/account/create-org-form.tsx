"use client";

import { useActionState, useState } from "react";
import { CreateOrgSchema, zodErrors, type FieldErrors } from "@/lib/schemas/org";
import { createOrgAction } from "@/lib/org-actions";
import { FieldError, inputBorder } from "@/components/ui/field-error";

export function CreateOrgForm() {
  const [state, action, isPending] = useActionState(createOrgAction, null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const nameError = clientErrors.name ?? state?.errors?.name;
  const globalError = clientErrors._ ?? state?.errors?._;

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const result = CreateOrgSchema.safeParse({ name: data.get("name") });
    if (!result.success) {
      e.preventDefault();
      setClientErrors(zodErrors(result.error));
    } else {
      setClientErrors({});
    }
  }

  return (
    <form action={action} onSubmit={validate} className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          name="name"
          required
          placeholder="Acme Inc."
          onChange={() => setClientErrors((p) => { const n = { ...p }; delete n.name; return n; })}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "create-org-name-error" : undefined}
          className={`w-full rounded-lg border bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-ink-400 focus:outline-none light:bg-white light:text-ink-900 light:placeholder:text-ink-400 ${inputBorder(Boolean(nameError))}`}
        />
        <FieldError message={nameError} id="create-org-name-error" />
      </div>

      <FieldError message={globalError} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 disabled:opacity-50 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
      >
        {isPending ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}
