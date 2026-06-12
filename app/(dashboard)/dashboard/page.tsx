import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Δεν βρέθηκε χρήστης.</div>;
  }

  const data = await getDashboardData(user.id);

  const statCards = [
    { label: "Ραντεβού σήμερα", value: data.appointmentsToday },
    { label: "Pending reminders", value: data.pendingReminders },
    { label: "Στάλθηκαν σήμερα", value: data.remindersSentToday },
    { label: "Failed reminders", value: data.failedReminders },
  ];

  return (
    <div className="space-y-8 p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold">Επισκόπηση</h1>
          <p className="text-sm text-slate-500 mt-2">
            Μια γρήγορη εικόνα για τα ραντεβού και τα reminders σου.
          </p>
        </div>

        <Link
          href="/appointments/new"
          className="primary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
        >
          + Νέο ραντεβού
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {statCards.map((card) => (
    <div
      key={card.label}
      className="app-panel stat-surface rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <p className="text-sm text-slate-500">{card.label}</p>
      <p className="mt-3 text-3xl font-semibold">{card.value}</p>
    </div>
  ))}
</section>

      <section className="app-panel overflow-hidden rounded-lg">
        <div className="flex items-center justify-between border-b border-[#e7e2ef] bg-[#faf9fd] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Επόμενα ραντεβού</h2>
            <p className="text-sm text-slate-500 mt-1">
              Τα πιο κοντινά προγραμματισμένα ραντεβού σου.
            </p>
          </div>

          <Link
            href="/appointments"
            className="text-sm font-medium underline underline-offset-4"
          >
            Όλα τα ραντεβού
          </Link>
        </div>

        {!data.upcomingAppointments.length ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-medium">
              Δεν υπάρχουν επερχόμενα ραντεβού
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Μόλις δημιουργήσεις το επόμενο ραντεβού, θα εμφανιστεί εδώ.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head text-left">
                <tr>
                  <th className="px-6 py-4 font-medium">Πελάτης</th>
                  <th className="px-6 py-4 font-medium">Ημερομηνία</th>
                  <th className="px-6 py-4 font-medium">Reminder</th>
                  <th className="px-6 py-4 font-medium">Κανάλι</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-slate-200/80 hover:bg-white/70">
                    <td className="px-6 py-4 font-medium">
                      {appointment.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat("el-GR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(appointment.appointment_at))}
                    </td>
                    <td className="px-6 py-4">
                      {appointment.reminder_status}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs text-slate-600">
                      {appointment.reminder_channel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
