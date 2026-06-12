"use client";

import { useActionState } from "react";
import { updateClientNotes } from "@/actions/clients";

const initialState = {
  success: false,
  message: "",
};

export function ClientNotesForm({
  clientId,
  notes,
}: {
  clientId: string;
  notes: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateClientNotes,
    initialState
  );

  return (
    <form action={formAction} className="app-panel rounded-lg p-6 space-y-4">
      <input type="hidden" name="id" value={clientId} />

      <div>
        <h2 className="text-lg font-semibold">Σημειώσεις πελάτη</h2>
        <p className="mt-1 text-sm text-slate-500">
          Μόνιμες σημειώσεις για τον πελάτη, ξεχωριστά από τις σημειώσεις κάθε
          ραντεβού.
        </p>
      </div>

      {state.message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <textarea
        name="notes"
        rows={7}
        defaultValue={notes}
        placeholder="Π.χ. προτιμά πρωινά, θέλει υπενθύμιση νωρίς, ειδικές οδηγίες..."
        className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="primary-action rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Αποθήκευση..." : "Αποθήκευση σημειώσεων"}
        </button>
      </div>
    </form>
  );
}
