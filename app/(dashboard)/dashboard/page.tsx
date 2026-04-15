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
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Επισκόπηση</h1>
          <p className="text-sm text-slate-500 mt-2">
            Μια γρήγορη εικόνα για τα ραντεβού και τα reminders σου.
          </p>
        </div>

        <Link
          href="/appointments/new"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          + Νέο ραντεβού
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {statCards.map((card) => (
    <div
      key={card.label}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <p className="text-sm text-slate-500">{card.label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
    </div>
  ))}
</section>

      <section className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
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
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Πελάτης</th>
                  <th className="px-6 py-4 font-medium">Ημερομηνία</th>
                  <th className="px-6 py-4 font-medium">Reminder</th>
                  <th className="px-6 py-4 font-medium">Κανάλι</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t">
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
                    <td className="px-6 py-4 uppercase text-xs tracking-wide text-slate-600">
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