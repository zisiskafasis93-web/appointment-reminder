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
  workday_start_time: string;
  workday_end_time: string;
  slot_interval_minutes: number;
  reminder_sms_body: string;
};

export function SettingsForm({ profile }: { profile: ProfileRecord }) {
  const [state, formAction, isPending] = useActionState(
    updateSettings,
    initialState
  );
  const defaultSmsBody =
    "Σας υπενθυμίζουμε το ραντεβού σας στο {business_name} στις {appointment_date} και ώρα {appointment_time}.";
  const savedSmsBody = profile.reminder_sms_body?.trim() ?? "";
  const isOldDefaultSmsBody =
    !savedSmsBody ||
    savedSmsBody.startsWith("Υπενθύμιση:") ||
    (savedSmsBody.includes("{client_name}") &&
      !savedSmsBody.includes("{business_name}"));
  const smsBody =
    isOldDefaultSmsBody ? defaultSmsBody : savedSmsBody;

  return (
    <form action={formAction} className="app-panel rounded-lg p-6 space-y-6">
      <input
        type="hidden"
        name="slotIntervalMinutes"
        value={profile.slot_interval_minutes}
      />

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
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
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
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />
        </Field>

	<Field
  label="Έναρξη ημέρας"
  htmlFor="workdayStartTime"
  error={state.fieldErrors?.workdayStartTime?.[0]}
>
  <input
    id="workdayStartTime"
    name="workdayStartTime"
    type="time"
    defaultValue={profile.workday_start_time}
    className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
  />
</Field>

<Field
  label="Λήξη ημέρας"
  htmlFor="workdayEndTime"
  error={state.fieldErrors?.workdayEndTime?.[0]}
>
  <input
    id="workdayEndTime"
    name="workdayEndTime"
    type="time"
    defaultValue={profile.workday_end_time}
    className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
  />
</Field>

<Field
  label="Κείμενο SMS reminder"
  htmlFor="reminderSmsBody"
  error={state.fieldErrors?.reminderSmsBody?.[0]}
  className="md:col-span-2"
>
  <textarea
    key={smsBody}
    id="reminderSmsBody"
    name="reminderSmsBody"
    rows={4}
    defaultValue={smsBody}
    className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
  />
<p className="text-xs text-slate-500">
  Διαθέσιμα placeholders: {"{client_name}"}, {"{appointment_date}"}, {"{appointment_time}"}, {"{business_name}"}
</p>
</Field>

        <Field
          label="Default κανάλι reminder"
          htmlFor="defaultReminderChannel"
          error={state.fieldErrors?.defaultReminderChannel?.[0]}
        >
          <select
            id="defaultReminderChannel"
            name="defaultReminderChannel"
            defaultValue="sms"
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
          >
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
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
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
          className="primary-action rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
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
