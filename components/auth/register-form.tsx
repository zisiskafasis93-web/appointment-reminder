"use client";

import { useActionState } from "react";
import { signUp } from "@/actions/auth";

const initialState = {
  success: false,
  message: "",
};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            state.success
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Ονοματεπώνυμο
        </label>
        <input
          id="fullName"
          name="fullName"
          className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder="π.χ. Νίκος Παπαδόπουλος"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="businessName" className="text-sm font-medium">
          Όνομα επιχείρησης
        </label>
        <input
          id="businessName"
          name="businessName"
          className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder="π.χ. Dental Care Studio"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder="τουλάχιστον 6 χαρακτήρες"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="primary-action w-full rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
      >
        {isPending ? "Δημιουργία..." : "Δημιουργία λογαριασμού"}
      </button>
    </form>
  );
}
