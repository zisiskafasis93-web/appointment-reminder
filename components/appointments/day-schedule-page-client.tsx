"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DaySchedulePanel } from "@/components/appointments/day-schedule-panel";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DaySchedulePageClient() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const prettyDate = useMemo(() => {
    return new Intl.DateTimeFormat("el-GR", {
      dateStyle: "full",
    }).format(new Date(`${selectedDate}T12:00:00`));
  }, [selectedDate]);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm text-slate-500">Schedule</p>
          <h1 className="text-3xl font-semibold">
            Πρόγραμμα ημέρας
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Δες τι έχεις κλεισμένο μέσα στη μέρα και ποιες ώρες είναι ελεύθερες.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
          />

          <Link
            href={`/appointments/new?date=${selectedDate}`}
            className="primary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
          >
            + Νέο ραντεβού
          </Link>
        </div>
      </div>

      <div className="app-panel rounded-lg p-5">
        <div className="text-sm text-slate-500">Επιλεγμένη ημέρα</div>
        <div className="mt-2 text-lg font-semibold">{prettyDate}</div>
      </div>

      <DaySchedulePanel date={selectedDate} />
    </div>
  );
}
