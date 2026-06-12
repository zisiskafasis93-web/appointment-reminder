"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppointment } from "@/actions/appointments";
import { DaySchedulePanel } from "@/components/appointments/day-schedule-panel";

const initialState = {
  success: false,
  message: "",
  fieldErrors: {},
};

type ClientSuggestion = {
  id: string | null;
  name: string;
  phone: string;
  appointmentCount: number;
  lastAppointmentAt: string;
};

type Props = {
  defaults?: {
    reminderChannel?: "email" | "sms";
    reminderOffsetMinutes?: number;
  };
  prefilledDate: string;
  initialClient?: {
    id: string;
    name: string;
    phone: string;
  } | null;
};

export function AppointmentForm({
  defaults,
  prefilledDate,
  initialClient,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createAppointment,
    initialState
  );

  const [selectedDate, setSelectedDate] = useState(prefilledDate);
  const [clientId, setClientId] = useState(initialClient?.id ?? "");
  const [clientName, setClientName] = useState(initialClient?.name ?? "");
  const [contactValue, setContactValue] = useState(initialClient?.phone ?? "");
  const [clientSuggestions, setClientSuggestions] = useState<
    ClientSuggestion[]
  >([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const contactType = "phone";
  const derivedReminderChannel = "sms";

  useEffect(() => {
    if (state.success) {
      router.push("/appointments?created=1");
    }
  }, [state.success, router]);

  useEffect(() => {
    const query = clientName.trim();

    if (query.length < 2) {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    async function loadSuggestions() {
      try {
        const res = await fetch(`/api/clients?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Δεν φορτώθηκαν οι πελάτες");
        }

        const data = await res.json();

        if (!ignore) {
          setClientSuggestions(data.clients ?? []);
          setShowClientSuggestions(true);
        }
      } catch (error) {
        if (!ignore && error instanceof Error && error.name !== "AbortError") {
          setClientSuggestions([]);
        }
      }
    }

    const timeout = window.setTimeout(loadSuggestions, 220);

    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [clientName]);

  function selectClient(client: ClientSuggestion) {
    setClientId(client.id ?? "");
    setClientName(client.name);
    setContactValue(client.phone);
    setShowClientSuggestions(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form
        action={formAction}
        className="app-panel rounded-lg p-6 space-y-6"
      >
        <input
          type="hidden"
          name="clientId"
          value={clientId}
        />
        <input
          type="hidden"
          name="reminderChannel"
          value={derivedReminderChannel}
        />

        {!state.success && state.message ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Όνομα πελάτη"
            htmlFor="clientName"
            error={state.fieldErrors?.clientName?.[0]}
          >
            <div className="relative">
              <input
                id="clientName"
                name="clientName"
                value={clientName}
                onChange={(event) => {
                  setClientId("");
                  setClientName(event.target.value);
                  setShowClientSuggestions(true);
                }}
                onFocus={() => {
                  if (clientSuggestions.length) {
                    setShowClientSuggestions(true);
                  }
                }}
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
              />

              {showClientSuggestions && clientSuggestions.length ? (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-[#e3dfeb] bg-white shadow-lg">
                  {clientSuggestions.map((client) => (
                    <button
                      key={`${client.name}-${client.phone}`}
                      type="button"
                      onClick={() => selectClient(client)}
                      className="block w-full px-4 py-3 text-left text-sm hover:bg-[#f2eefb]"
                    >
                      <span className="font-medium text-slate-900">
                        {client.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {client.phone} · {client.appointmentCount} ραντεβού
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </Field>

          <Field
            label="Τύπος επικοινωνίας"
            htmlFor="contactType"
            error={state.fieldErrors?.contactType?.[0]}
          >
            <div className="space-y-2">
              <select
                id="contactType"
                name="contactType"
                defaultValue={contactType}
                className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
              >
                <option value="phone">Κινητό</option>
              </select>

              <p className="text-xs text-slate-500">
                Το κανάλι reminder θα οριστεί αυτόματα:{" "}
                SMS.
              </p>
            </div>
          </Field>

          <Field
            label="Κινητό"
            htmlFor="contactValue"
            error={state.fieldErrors?.contactValue?.[0]}
          >
            <input
              id="contactValue"
              name="contactValue"
              value={contactValue}
              onChange={(event) => {
                setClientId("");
                setContactValue(event.target.value);
              }}
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>

          <Field
            label="Διάρκεια (λεπτά)"
            htmlFor="durationMinutes"
            error={state.fieldErrors?.durationMinutes?.[0]}
          >
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={5}
              step={5}
              defaultValue={30}
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
            />
          </Field>

          <Field
            label="Ημερομηνία"
            htmlFor="appointmentDate"
            error={state.fieldErrors?.appointmentDate?.[0]}
          >
            <input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              defaultValue={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
            />
          </Field>

          <Field
            label="Ώρα"
            htmlFor="appointmentTime"
            error={state.fieldErrors?.appointmentTime?.[0]}
          >
            <input
              id="appointmentTime"
              name="appointmentTime"
              type="time"
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
            />
          </Field>

          <Field
            label="Πότε να σταλεί"
            htmlFor="reminderOffsetMinutes"
            error={state.fieldErrors?.reminderOffsetMinutes?.[0]}
          >
            <select
              id="reminderOffsetMinutes"
              name="reminderOffsetMinutes"
              defaultValue={String(defaults?.reminderOffsetMinutes ?? 1440)}
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
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
            error={state.fieldErrors?.notes?.[0]}
            className="md:col-span-2"
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="secondary-action rounded-lg px-4 py-3 text-sm font-medium"
          >
            Ακύρωση
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="primary-action rounded-lg px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {isPending ? "Αποθήκευση..." : "Αποθήκευση ραντεβού"}
          </button>
        </div>
      </form>

      <DaySchedulePanel date={selectedDate} />
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
