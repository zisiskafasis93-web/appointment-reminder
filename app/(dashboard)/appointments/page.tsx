import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { ReminderStatusBadge } from "@/components/appointments/reminder-status-badge";

export default async function AppointmentsPage({
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

  const search = typeof params.search === "string" ? params.search.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";

  let query = supabase
    .from("appointments")
    .select(
      "id, client_name, contact_type, contact_value, appointment_at, status, reminder_channel, reminder_status, notes"
    )
    .eq("user_id", user.id)
    .order("appointment_at", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `client_name.ilike.%${search}%,contact_value.ilike.%${search}%,notes.ilike.%${search}%`
    );
  }

  const { data: appointments, error } = await query;

  const successMessage =
    params.created === "1"
      ? "Το ραντεβού δημιουργήθηκε κανονικά."
      : params.updated === "1"
      ? "Το ραντεβού ενημερώθηκε κανονικά."
      : params.cancelled === "1"
      ? "Το ραντεβού ακυρώθηκε κανονικά."
      : null;

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Appointments</p>
          <h1 className="text-3xl font-semibold tracking-tight">Ραντεβού</h1>
          <p className="text-sm text-slate-500 mt-2">
            Παρακολούθησε τα ραντεβού και βρες γρήγορα αυτό που θέλεις.
          </p>
        </div>

        <Link
          href="/appointments/new"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          + Νέο ραντεβού
        </Link>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <form className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Αναζήτηση με όνομα, email, κινητό ή σημείωση"
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />

          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
          >
            <option value="all">Όλα</option>
            <option value="scheduled">Προγραμματισμένα</option>
            <option value="cancelled">Ακυρωμένα</option>
            <option value="completed">Ολοκληρωμένα</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl border px-4 py-3 text-sm font-medium"
          >
            Φιλτράρισμα
          </button>
        </div>
      </form>

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {error ? (
          <div className="p-6 text-sm text-red-600">
            Δεν φορτώθηκαν τα ραντεβού.
          </div>
        ) : !appointments?.length ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-medium">Δεν βρέθηκαν ραντεβού</h2>
            <p className="text-sm text-slate-500 mt-2">
              Δοκίμασε άλλα φίλτρα ή δημιούργησε νέο ραντεβού.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Πελάτης</th>
                  <th className="px-6 py-4 font-medium">Επικοινωνία</th>
                  <th className="px-6 py-4 font-medium">Ημερομηνία</th>
                  <th className="px-6 py-4 font-medium">Κατάσταση</th>
                  <th className="px-6 py-4 font-medium">Reminder</th>
                  <th className="px-6 py-4 font-medium text-right">Ενέργεια</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t align-top">
                    <td className="px-6 py-4 font-medium">
                      {appointment.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <div>{appointment.contact_value}</div>
                      <div className="text-xs text-slate-500 mt-1 uppercase">
                        {appointment.contact_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat("el-GR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(appointment.appointment_at))}
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <ReminderStatusBadge status={appointment.reminder_status} />
                        <span className="text-xs uppercase text-slate-500">
                          {appointment.reminder_channel}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="text-sm font-medium underline underline-offset-4"
                      >
                        Προβολή
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}