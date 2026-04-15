"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/actions/appointments";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

type Props = {
  defaults?: {
    reminderChannel?: "email" | "sms";
    reminderOffsetMinutes?: number;
  };
};

export function AppointmentForm({ defaults }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createAppointment, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/appointments?created=1");
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
      {!state.success && state.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Όνομα πελάτη" htmlFor="clientName" error={state.fieldErrors?.clientName?.[0]}>
          <input id="clientName" name="clientName" className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400" />
        </Field>

        <Field label="Τύπος επικοινωνίας" htmlFor="contactType" error={state.fieldErrors?.contactType?.[0]}>
          <select id="contactType" name="contactType" defaultValue="email" className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400">
            <option value="email">Email</option>
            <option value="phone">Κινητό</option>
          </select>
        </Field>

        <Field label="Email ή κινητό" htmlFor="contactValue" error={state.fieldErrors?.contactValue?.[0]}>
          <input id="contactValue" name="contactValue" className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400" />
        </Field>

        <Field label="Διάρκεια (λεπτά)" htmlFor="durationMinutes" error={state.fieldErrors?.durationMinutes?.[0]}>
          <input id="durationMinutes" name="durationMinutes" type="number" min={5} step={5} defaultValue={30} className="w-full rounded-2xl border px-4 py-3" />
        </Field>

        <Field label="Ημερομηνία" htmlFor="appointmentDate" error={state.fieldErrors?.appointmentDate?.[0]}>
          <input id="appointmentDate" name="appointmentDate" type="date" className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400" />
        </Field>

        <Field label="Ώρα" htmlFor="appointmentTime" error={state.fieldErrors?.appointmentTime?.[0]}>
          <input id="appointmentTime" name="appointmentTime" type="time" className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400" />
        </Field>

        <Field label="Κανάλι reminder" htmlFor="reminderChannel" error={state.fieldErrors?.reminderChannel?.[0]}>
          <select
            id="reminderChannel"
            name="reminderChannel"
            defaultValue={defaults?.reminderChannel ?? "email"}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </Field>

        <Field label="Πότε να σταλεί" htmlFor="reminderOffsetMinutes" error={state.fieldErrors?.reminderOffsetMinutes?.[0]}>
          <select
            id="reminderOffsetMinutes"
            name="reminderOffsetMinutes"
            defaultValue={String(defaults?.reminderOffsetMinutes ?? 1440)}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          >
            <option value="1440">24 ώρες πριν</option>
            <option value="180">3 ώρες πριν</option>
            <option value="60">1 ώρα πριν</option>
            <option value="30">30 λεπτά πριν</option>
          </select>
        </Field>

        <Field label="Σημειώσεις" htmlFor="notes" error={state.fieldErrors?.notes?.[0]} className="md:col-span-2">
          <textarea id="notes" name="notes" rows={4} className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400" />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-2xl border px-4 py-3 text-sm font-medium"
        >
          Ακύρωση
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Αποθήκευση..." : "Αποθήκευση ραντεβού"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}