"use client";

import { useActionState, useRef, useState } from "react";
import { CreateOrgSchema, zodErrors, type FieldErrors } from "@/lib/schemas/org";
import { createOrgAction } from "@/lib/org-actions";
import { FieldError, inputBorder } from "@/components/ui/field-error";

export function CreateOrgDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, isPending] = useActionState(createOrgAction, null);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  // Field errors: client wins over server (client validated more recently)
  const nameError = clientErrors.name ?? state?.errors?.name;
  const globalError = clientErrors._ ?? state?.errors?._;

  function open() {
    setClientErrors({});
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setClientErrors({});
  }

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

  function clearField(field: string) {
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5" aria-hidden>
          <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3Z" />
        </svg>
        New organization
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-0 shadow-lift backdrop:bg-black/60 backdrop:backdrop-blur-sm light:border-ink-900/10 light:bg-white"
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white light:text-ink-900">
                New organization
              </h3>
              <p className="mt-0.5 text-sm text-ink-400 light:text-ink-500">
                You will be set as admin and can invite team members after.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-ink-400 transition hover:bg-white/5 hover:text-white light:hover:bg-ink-900/5 light:hover:text-ink-900"
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <form action={action} onSubmit={validate} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dialog-org-name" className="text-xs font-medium text-ink-300 light:text-ink-500">
                Organization name
              </label>
              <input
                id="dialog-org-name"
                type="text"
                name="name"
                required
                autoFocus
                placeholder="Acme Inc."
                onChange={() => clearField("name")}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "dialog-org-name-error" : undefined}
                className={`w-full rounded-lg border bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-ink-400 focus:outline-none light:bg-white light:text-ink-900 light:placeholder:text-ink-400 ${inputBorder(Boolean(nameError))}`}
              />
              <FieldError message={nameError} id="dialog-org-name-error" />
            </div>

            <FieldError message={globalError} />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-ink-300 transition hover:bg-white/5 light:border-ink-900/10 light:text-ink-500 light:hover:bg-ink-900/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 disabled:opacity-50 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
              >
                {isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
