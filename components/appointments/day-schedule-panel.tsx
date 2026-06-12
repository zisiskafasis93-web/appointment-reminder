"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";

type DayAppointment = {
  id: string;
  clientName: string;
  start: string;
  end: string;
  status: "scheduled" | "cancelled" | "completed";
};

export function DaySchedulePanel({ date }: { date: string }) {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<DayAppointment[]>([]);
  const [error, setError] = useState("");
  const duplicateStarts = useMemo(() => {
    const byStart = new Map<string, DayAppointment[]>();

    for (const appointment of appointments.filter(
      (item) => item.status !== "cancelled"
    )) {
      const items = byStart.get(appointment.start) ?? [];
      items.push(appointment);
      byStart.set(appointment.start, items);
    }

    return Array.from(byStart.entries())
      .filter(([, items]) => items.length > 1)
      .map(([start, items]) => ({
        start,
        clients: items.map((item) => item.clientName),
      }));
  }, [appointments]);

  useEffect(() => {
    if (!date) return;

    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/day-schedule?date=${date}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Δεν φορτώθηκε το πρόγραμμα ημέρας");
        }

        if (!ignore) {
          setAppointments(data.appointments ?? []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Άγνωστο σφάλμα"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [date]);

  return (
    <div className="app-panel space-y-4 rounded-lg p-6">
      <div>
        <h3 className="text-lg font-semibold">Ραντεβού ημέρας</h3>
        <p className="text-sm text-slate-500 mt-1">
          Δες όλα τα ραντεβού της επιλεγμένης ημέρας.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Φόρτωση...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        !appointments.length ? (
          <p className="text-sm text-slate-500">
            Δεν υπάρχουν ραντεβού αυτή την ημέρα.
          </p>
        ) : (
          <div className="space-y-2">
            {appointments.map((item) => (
              <div
                key={item.id}
                className="soft-accent-surface rounded-lg px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{item.clientName}</div>
                    <div className="text-sm text-slate-500">
                      {item.start} - {item.end}
                    </div>
                  </div>
                  <AppointmentStatusBadge status={item.status} />
                </div>
              </div>
            ))}

            {duplicateStarts.length ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div className="font-medium">
                  Υπάρχουν ραντεβού στην ίδια ώρα.
                </div>
                <div className="mt-1 space-y-1">
                  {duplicateStarts.map((item) => (
                    <div key={item.start}>
                      {item.start}: {item.clients.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
