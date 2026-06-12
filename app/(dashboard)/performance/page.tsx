import { createClient } from "@/lib/supabase/server";
import { completeElapsedAppointments } from "@/lib/appointments/status";

type AppointmentStatus = "scheduled" | "cancelled" | "completed";

type AppointmentRow = {
  id: string;
  client_name: string;
  contact_value: string;
  appointment_at: string;
  status: AppointmentStatus;
};

type MonthMetric = {
  key: string;
  label: string;
  fullLabel: string;
  total: number;
  completed: number;
  cancelled: number;
  scheduled: number;
  newClients: number;
};

type TopClient = {
  name: string;
  phone: string;
  total: number;
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Δεν βρέθηκε χρήστης.</div>;
  }

  await completeElapsedAppointments(user.id);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, client_name, contact_value, appointment_at, status")
    .eq("user_id", user.id)
    .order("appointment_at", { ascending: true });

  const rows = (appointments ?? []) as AppointmentRow[];
  const months = buildMonthMetrics(rows);
  const requestedMonth =
    typeof params.month === "string" &&
    months.some((month) => month.key === params.month)
      ? params.month
      : getMonthKey(new Date());
  const currentMonth =
    months.find((month) => month.key === requestedMonth) ?? months[0];
  const selectedMonthRows = rows.filter(
    (row) => getMonthKey(new Date(row.appointment_at)) === currentMonth.key
  );
  const topClients = buildTopClients(selectedMonthRows);
  const peakHours = buildPeakHours(selectedMonthRows);
  const maxMonthlyTotal = Math.max(...months.map((item) => item.total), 1);
  const maxNewClients = Math.max(...months.map((item) => item.newClients), 1);
  const maxTopClient = Math.max(...topClients.map((item) => item.total), 1);
  const maxPeakHour = Math.max(...peakHours.map((item) => item.total), 1);
  const cancellationRate = currentMonth.total
    ? Math.round((currentMonth.cancelled / currentMonth.total) * 100)
    : 0;
  const mostFrequentClient = topClients[0];

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Performance</p>
          <h1 className="text-3xl font-semibold">Επίδοση</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Μια καθαρή εικόνα για τα ραντεβού, τις ακυρώσεις και τους πιο
            ενεργούς πελάτες σου ανά μήνα.
          </p>
        </div>

        <form className="app-panel rounded-lg p-3">
          <label
            htmlFor="month"
            className="mb-2 block text-xs font-medium text-zinc-500"
          >
            Μήνας προβολής
          </label>
          <div className="flex gap-2">
            <select
              id="month"
              name="month"
              defaultValue={currentMonth.key}
              className="min-w-44 rounded-lg border border-zinc-300/80 bg-white/90 px-3 py-2 text-sm text-zinc-900"
            >
              {months.map((month) => (
                <option key={month.key} value={month.key}>
                  {month.fullLabel}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="secondary-action rounded-lg px-4 py-2 text-sm font-medium"
            >
              Προβολή
            </button>
          </div>
        </form>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Δεν φορτώθηκαν τα στατιστικά.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={`Ραντεβού ${currentMonth.fullLabel}`}
          value={currentMonth.total}
          tone="lavender"
          detail={`${currentMonth.completed} ολοκληρωμένα`}
        />
        <MetricCard
          label={`Ακυρώσεις ${currentMonth.fullLabel}`}
          value={currentMonth.cancelled}
          tone="rose"
          detail={`${cancellationRate}% ποσοστό ακύρωσης`}
        />
        <MetricCard
          label={`Νέοι πελάτες ${currentMonth.fullLabel}`}
          value={currentMonth.newClients}
          tone="amber"
          detail="με πρώτο ραντεβού αυτόν τον μήνα"
        />
        <MetricCard
          label="Πιο συχνός πελάτης"
          value={mostFrequentClient?.name ?? "-"}
          tone="stone"
          detail={
            mostFrequentClient
              ? `${mostFrequentClient.total} ραντεβού`
              : "Δεν υπάρχουν δεδομένα"
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Ραντεβού ανά μήνα"
          description="Σύνολο ραντεβού με βάση την ημερομηνία ραντεβού."
        >
          <MonthlyBarChart months={months} maxValue={maxMonthlyTotal} />
        </Panel>

        <Panel
          title="Κατάσταση ραντεβού"
          description="Ολοκληρωμένα, προγραμματισμένα και ακυρωμένα ανά μήνα."
        >
          <StatusStackChart months={months} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Νέοι πελάτες ανά μήνα"
          description="Πελάτες που εμφανίστηκαν πρώτη φορά μέσα στον μήνα."
        >
          <CompactBarChart
            data={months.map((month) => ({
              label: month.label,
              value: month.newClients,
            }))}
            maxValue={maxNewClients}
            colorClass="bg-amber-500"
          />
        </Panel>

        <Panel
          title="Πιο συχνοί πελάτες"
          description={`Με βάση τα ραντεβού του μήνα ${currentMonth.fullLabel}.`}
        >
          <RankingList items={topClients} maxValue={maxTopClient} />
        </Panel>

        <Panel
          title="Ώρες αιχμής"
          description={`Οι ώρες που κλείστηκαν συχνότερα τον μήνα ${currentMonth.fullLabel}.`}
        >
          <PeakHourList items={peakHours} maxValue={maxPeakHour} />
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number | string;
  detail: string;
  tone: "lavender" | "amber" | "rose" | "stone";
}) {
  const toneClass = {
    lavender: "border-l-[#7766c2] bg-[#f5f2fc]",
    amber: "border-l-amber-500 bg-amber-50/60",
    rose: "border-l-rose-500 bg-rose-50/50",
    stone: "border-l-stone-500 bg-stone-50/70",
  }[tone];

  return (
    <div className={`app-panel rounded-lg border-l-4 p-5 ${toneClass}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 truncate text-3xl font-semibold text-zinc-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-panel rounded-lg p-5">
      <div className="border-b border-zinc-200/80 pb-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
    </div>
  );
}

function MonthlyBarChart({
  months,
  maxValue,
}: {
  months: MonthMetric[];
  maxValue: number;
}) {
  return (
    <div className="flex h-72 items-end gap-2">
      {months.map((month) => (
        <div key={month.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-56 w-full items-end rounded-lg bg-white/70 px-1 py-1 ring-1 ring-zinc-200/80">
            <div
              className="w-full rounded-md bg-[#7766c2]"
              style={{
                height: `${Math.max((month.total / maxValue) * 100, month.total ? 6 : 0)}%`,
              }}
              title={`${month.total} ραντεβού`}
            />
          </div>
          <div className="text-[11px] text-zinc-500">{month.label}</div>
        </div>
      ))}
    </div>
  );
}

function StatusStackChart({ months }: { months: MonthMetric[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        <Legend colorClass="bg-[#7766c2]" label="Ολοκληρωμένα" />
        <Legend colorClass="bg-amber-500" label="Προγραμματισμένα" />
        <Legend colorClass="bg-rose-500" label="Ακυρωμένα" />
      </div>

      <div className="space-y-3">
        {months.map((month) => {
          const completed = month.total
            ? (month.completed / month.total) * 100
            : 0;
          const scheduled = month.total
            ? (month.scheduled / month.total) * 100
            : 0;
          const cancelled = month.total
            ? (month.cancelled / month.total) * 100
            : 0;

          return (
            <div key={month.key} className="grid grid-cols-[42px_1fr_34px] items-center gap-3">
              <div className="text-xs text-zinc-500">{month.label}</div>
              <div className="flex h-5 overflow-hidden rounded-full bg-white ring-1 ring-zinc-200">
                <div className="bg-[#7766c2]" style={{ width: `${completed}%` }} />
                <div className="bg-amber-500" style={{ width: `${scheduled}%` }} />
                <div className="bg-rose-500" style={{ width: `${cancelled}%` }} />
              </div>
              <div className="text-right text-xs text-zinc-500">
                {month.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactBarChart({
  data,
  maxValue,
  colorClass,
}: {
  data: Array<{ label: string; value: number }>;
  maxValue: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[42px_1fr_28px] items-center gap-3">
          <span className="text-xs text-zinc-500">{item.label}</span>
          <div className="h-3 rounded-full bg-white ring-1 ring-zinc-200">
            <div
              className={`h-full rounded-full ${colorClass}`}
              style={{
                width: `${Math.max((item.value / maxValue) * 100, item.value ? 8 : 0)}%`,
              }}
            />
          </div>
          <span className="text-right text-xs text-zinc-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function RankingList({
  items,
  maxValue,
}: {
  items: TopClient[];
  maxValue: number;
}) {
  if (!items.length) {
    return <EmptyText>Δεν υπάρχουν ακόμα πελάτες με ραντεβού.</EmptyText>;
  }

  return (
    <div className="space-y-4">
      {items.slice(0, 6).map((item) => (
        <div key={`${item.name}-${item.phone}`} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-900">
                {item.name}
              </div>
              <div className="truncate text-xs text-zinc-500">{item.phone}</div>
            </div>
            <div className="text-sm font-semibold text-zinc-700">
              {item.total}
            </div>
          </div>
          <div className="h-2 rounded-full bg-white ring-1 ring-zinc-200">
            <div
              className="h-full rounded-full bg-[#7766c2]"
              style={{ width: `${Math.max((item.total / maxValue) * 100, 8)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PeakHourList({
  items,
  maxValue,
}: {
  items: Array<{ hour: string; total: number }>;
  maxValue: number;
}) {
  if (!items.length) {
    return <EmptyText>Δεν υπάρχουν ακόμα αρκετά ραντεβού.</EmptyText>;
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 8).map((item) => (
        <div key={item.hour} className="grid grid-cols-[48px_1fr_28px] items-center gap-3">
          <span className="text-xs font-medium text-zinc-600">{item.hour}</span>
          <div className="h-3 rounded-full bg-white ring-1 ring-zinc-200">
            <div
              className="h-full rounded-full bg-rose-500"
              style={{
                width: `${Math.max((item.total / maxValue) * 100, 8)}%`,
              }}
            />
          </div>
          <span className="text-right text-xs text-zinc-500">{item.total}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

function buildMonthMetrics(rows: AppointmentRow[]) {
  const months = getLastTwelveMonths();
  const byMonth = new Map<string, MonthMetric>(
    months.map((month) => [
      month.key,
      {
        ...month,
        total: 0,
        completed: 0,
        cancelled: 0,
        scheduled: 0,
        newClients: 0,
      },
    ])
  );
  const firstClientMonth = new Map<string, string>();

  for (const row of rows) {
    const appointmentDate = new Date(row.appointment_at);
    const monthKey = getMonthKey(appointmentDate);
    const clientKey = getClientKey(row);

    if (!firstClientMonth.has(clientKey)) {
      firstClientMonth.set(clientKey, monthKey);
    }

    const month = byMonth.get(monthKey);

    if (!month) {
      continue;
    }

    month.total += 1;
    month[row.status] += 1;
  }

  for (const monthKey of firstClientMonth.values()) {
    const month = byMonth.get(monthKey);

    if (month) {
      month.newClients += 1;
    }
  }

  return Array.from(byMonth.values());
}

function buildTopClients(rows: AppointmentRow[]) {
  const clients = new Map<string, TopClient>();

  for (const row of rows) {
    const key = getClientKey(row);
    const existing = clients.get(key);

    if (existing) {
      existing.total += 1;
    } else {
      clients.set(key, {
        name: row.client_name,
        phone: row.contact_value,
        total: 1,
      });
    }
  }

  return Array.from(clients.values()).sort((a, b) => b.total - a.total);
}

function buildPeakHours(rows: AppointmentRow[]) {
  const hours = new Map<string, number>();

  for (const row of rows) {
    const date = new Date(row.appointment_at);
    const hour = `${String(date.getHours()).padStart(2, "0")}:00`;
    hours.set(hour, (hours.get(hour) ?? 0) + 1);
  }

  return Array.from(hours.entries())
    .map(([hour, total]) => ({ hour, total }))
    .sort((a, b) => b.total - a.total || a.hour.localeCompare(b.hour));
}

function getLastTwelveMonths() {
  const now = new Date();
  const months: Array<{ key: string; label: string; fullLabel: string }> = [];

  for (let index = 0; index < 12; index += 1) {
    const date = new Date(now.getFullYear(), index, 1);
    months.push({
      key: getMonthKey(date),
      label: new Intl.DateTimeFormat("el-GR", { month: "short" }).format(date),
      fullLabel: new Intl.DateTimeFormat("el-GR", {
        month: "long",
        year: "numeric",
      }).format(date),
    });
  }

  return months;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getClientKey(row: AppointmentRow) {
  return `${row.client_name.trim().toLowerCase()}|${row.contact_value.trim()}`;
}
