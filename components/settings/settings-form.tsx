"use client";

import { useActionState } from "react";
import { updateSettings } from "@/actions/settings";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

type ProfileRecord = {
  full_name: string | null;
  business_name: string | null;
  default_reminder_channel: "email" | "sms";
  default_reminder_offset_minutes: number;
};

export function SettingsForm({ profile }: { profile: ProfileRecord }) {
  const [state, formAction, isPending] = useActionState(
    updateSettings,
    initialState
  );

  return (
    <form action={formAction} className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="Ονοματεπώνυμο"
          htmlFor="fullName"
          error={state.fieldErrors?.fullName?.[0]}
        >
          <input
            id="fullName"
            name="fullName"
            defaultValue={profile.full_name ?? ""}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />
        </Field>

        <Field
          label="Όνομα επιχείρησης"
          htmlFor="businessName"
          error={state.fieldErrors?.businessName?.[0]}
        >
          <input
            id="businessName"
            name="businessName"
            defaultValue={profile.business_name ?? ""}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />
        </Field>

        <Field
          label="Default κανάλι reminder"
          htmlFor="defaultReminderChannel"
          error={state.fieldErrors?.defaultReminderChannel?.[0]}
        >
          <select
            id="defaultReminderChannel"
            name="defaultReminderChannel"
            defaultValue={profile.default_reminder_channel}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </Field>

        <Field
          label="Default χρόνος αποστολής"
          htmlFor="defaultReminderOffsetMinutes"
          error={state.fieldErrors?.defaultReminderOffsetMinutes?.[0]}
        >
          <select
            id="defaultReminderOffsetMinutes"
            name="defaultReminderOffsetMinutes"
            defaultValue={String(profile.default_reminder_offset_minutes)}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
          >
            <option value="1440">24 ώρες πριν</option>
            <option value="180">3 ώρες πριν</option>
            <option value="60">1 ώρα πριν</option>
            <option value="30">30 λεπτά πριν</option>
          </select>
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Αποθήκευση..." : "Αποθήκευση ρυθμίσεων"}
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
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}