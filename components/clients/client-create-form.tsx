"use client";

import { useActionState } from "react";
import { createClientRecord } from "@/actions/clients";

const initialState = {
  success: false,
  message: "",
};

export function ClientCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createClientRecord,
    initialState
  );

  return (
    <form action={formAction} className="app-panel rounded-lg p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Νέος πελάτης</h2>
        <p className="mt-1 text-sm text-slate-500">
          Πέρασε τα βασικά στοιχεία του πελάτη. Μετά μπορείς να ανοίξεις την
          καρτέλα του για σημειώσεις ή νέο ραντεβού.
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Όνομα πελάτη</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="π.χ. Μαρία Παπαδοπούλου"
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Κινητό</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            placeholder="π.χ. 69xxxxxxxx"
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="primary-action rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Δημιουργία..." : "Δημιουργία πελάτη"}
        </button>
      </div>
    </form>
  );
}
