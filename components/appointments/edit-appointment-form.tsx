"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateAppointment, cancelAppointment } from "@/actions/appointments";
import { splitAppointmentDateTime } from "@/lib/appointments/mappers";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

type AppointmentRecord = {
  id: string;
  client_name: string;
  contact_type: "email" | "phone";
  contact_value: string;
  appointment_at: string;
  duration_minutes: number;
  notes: string | null;
  reminder_channel: "email" | "sms";
  reminder_offset_minutes: number;
  reminder_status: "pending" | "processing" | "sent" | "failed" | "cancelled";
  status: "scheduled" | "cancelled" | "completed";
};

export function EditAppointmentForm({
  appointment,
}: {
  appointment: AppointmentRecord;
}) {
  const router = useRouter();
  const [updateState, updateAction, isUpdating] = useActionState(
    updateAppointment,
    initialState
  );
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelAppointment,
    initialState
  );

  useEffect(() => {
    if (updateState.success) {
      router.push("/appointments?updated=1");
    }
  }, [updateState.success, router]);

  useEffect(() => {
    if (cancelState.success) {
      router.push("/appointments?cancelled=1");
    }
  }, [cancelState.success, router]);

  const dateTime = splitAppointmentDateTime(appointment.appointment_at);
  const fieldErrors = updateState.fieldErrors ?? {};
  const message = updateState.message || cancelState.message;

  return (
    <div className="space-y-6">
      {message && !updateState.success && !cancelState.success ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <form
        action={updateAction}
        className="rounded-3xl border bg-white p-6 shadow-sm space-y-6"
      >
        <input type="hidden" name="id" value={appointment.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Όνομα πελάτη"
            htmlFor="clientName"
            error={fieldErrors.clientName?.[0]}
            className="md:col-span-2"
          >
            <input
              id="clientName"
              name="clientName"
              defaultValue={appointment.client_name}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Τύπος επικοινωνίας"
            htmlFor="contactType"
            error={fieldErrors.contactType?.[0]}
          >
            <select
              id="contactType"
              name="contactType"
              defaultValue={appointment.contact_type}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            >
              <option value="email">Email</option>
              <option value="phone">Κινητό</option>
            </select>
          </Field>

          <Field
            label="Email ή κινητό"
            htmlFor="contactValue"
            error={fieldErrors.contactValue?.[0]}
          >
            <input
              id="contactValue"
              name="contactValue"
              defaultValue={appointment.contact_value}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Ημερομηνία"
            htmlFor="appointmentDate"
            error={fieldErrors.appointmentDate?.[0]}
          >
            <input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              defaultValue={dateTime.date}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Ώρα"
            htmlFor="appointmentTime"
            error={fieldErrors.appointmentTime?.[0]}
          >
            <input
              id="appointmentTime"
              name="appointmentTime"
              type="time"
              defaultValue={dateTime.time}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Διάρκεια (λεπτά)"
            htmlFor="durationMinutes"
            error={fieldErrors.durationMinutes?.[0]}
          >
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={5}
              step={5}
              defaultValue={appointment.duration_minutes}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Κανάλι reminder"
            htmlFor="reminderChannel"
            error={fieldErrors.reminderChannel?.[0]}
          >
            <select
              id="reminderChannel"
              name="reminderChannel"
              defaultValue={appointment.reminder_channel}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </Field>

          <Field
            label="Πότε να σταλεί"
            htmlFor="reminderOffsetMinutes"
            error={fieldErrors.reminderOffsetMinutes?.[0]}
          >
            <select
              id="reminderOffsetMinutes"
              name="reminderOffsetMinutes"
              defaultValue={String(appointment.reminder_offset_minutes)}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            >
              <option value="1440">24 ώρες πριν</option>
              <option value="180">3 ώρες πριν</option>
              <option value="60">1 ώρα πριν</option>
              <option value="30">30 λεπτά πριν</option>
            </select>
          </Field>

          <Field
            label="Σημειώσεις"
            htmlFor="notes"
            error={fieldErrors.notes?.[0]}
            className="md:col-span-2"
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={appointment.notes ?? ""}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Reminder status:{" "}
            <span className="font-medium">{appointment.reminder_status}</span>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {isUpdating ? "Αποθήκευση..." : "Αποθήκευση αλλαγών"}
          </button>
        </div>
      </form>

      {appointment.status !== "cancelled" ? (
        <form
          action={cancelAction}
          className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm"
        >
          <input type="hidden" name="id" value={appointment.id} />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-800">
                Ακύρωση ραντεβού
              </h2>
              <p className="text-sm text-red-700 mt-1">
                Αν το ακυρώσεις, το reminder θα σταματήσει και δεν θα σταλεί
                ποτέ.
              </p>
            </div>

            <button
              type="submit"
              disabled={isCancelling}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isCancelling ? "Ακύρωση..." : "Ακύρωση ραντεβού"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
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