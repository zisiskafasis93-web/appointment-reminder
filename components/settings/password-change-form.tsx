"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/actions/auth";

const initialState = {
  success: false,
  message: "",
};

export function PasswordChangeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    changePassword,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="app-panel rounded-lg p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold">Αλλαγή κωδικού</h2>
          <p className="mt-2 text-sm text-slate-500">
            Βάλε τον τρέχοντα κωδικό και όρισε έναν νέο για τον λογαριασμό σου.
          </p>
        </div>

        <div className="w-full max-w-xl space-y-4">
          {state.message ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                state.success
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <PasswordField
            id="currentPassword"
            name="currentPassword"
            label="Τρέχων κωδικός"
            autoComplete="current-password"
          />
          <PasswordField
            id="newPassword"
            name="newPassword"
            label="Νέος κωδικός"
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Επιβεβαίωση νέου κωδικού"
            autoComplete="new-password"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="primary-action rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
            >
              {isPending ? "Αλλαγή..." : "Αλλαγή κωδικού"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        minLength={8}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
