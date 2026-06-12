import { createClient } from "@/lib/supabase/server";
import { DeliveryStatusBadge } from "@/components/logs/delivery-status-badge";

export default async function LogsPage({
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
    .from("message_logs")
    .select(`
      id,
      appointment_id,
      recipient,
      subject,
      channel,
      delivery_status,
      error_message,
      created_at,
      appointments:appointment_id (
        client_name,
        appointment_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq("delivery_status", status);
  }

  if (search) {
    query = query.or(
      `recipient.ilike.%${search}%,subject.ilike.%${search}%,error_message.ilike.%${search}%`
    );
  }

  const { data: logs, error } = await query;

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-500">Logs</p>
        <h1 className="text-3xl font-semibold">
          Ιστορικό αποστολών
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Δες ποια reminders στάλθηκαν, ποια απέτυχαν και τι ακριβώς συνέβη.
        </p>
      </div>

      <form className="app-panel rounded-lg p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Αναζήτηση με recipient, subject ή error"
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />

          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900"
          >
            <option value="all">Όλα</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl border px-4 py-3 text-sm font-medium"
          >
            Φιλτράρισμα
          </button>
        </div>
      </form>

      <div className="app-panel overflow-hidden rounded-lg">
        {error ? (
          <div className="p-6 text-sm text-red-600">
            Δεν φορτώθηκαν τα logs αποστολών.
          </div>
        ) : !logs?.length ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-medium">Δεν βρέθηκαν logs</h2>
            <p className="text-sm text-slate-500 mt-2">
              Μόλις σταλούν reminders ή αλλάξεις φίλτρα, θα εμφανιστούν εδώ.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head text-left">
                <tr>
                  <th className="px-6 py-4 font-medium">Πελάτης</th>
                  <th className="px-6 py-4 font-medium">Παραλήπτης</th>
                  <th className="px-6 py-4 font-medium">Κανάλι</th>
                  <th className="px-6 py-4 font-medium">Κατάσταση</th>
                  <th className="px-6 py-4 font-medium">Στάλθηκε</th>
                  <th className="px-6 py-4 font-medium">Ραντεβού</th>
                  <th className="px-6 py-4 font-medium">Σφάλμα</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const appointment = Array.isArray(log.appointments)
                    ? log.appointments[0]
                    : log.appointments;

                  return (
                    <tr key={log.id} className="border-t align-top">
                      <td className="px-6 py-4 font-medium">
                        {appointment?.client_name ?? "—"}
                      </td>
                      <td className="px-6 py-4">{log.recipient}</td>
                      <td className="px-6 py-4 uppercase text-xs text-slate-600">
                        {log.channel}
                      </td>
                      <td className="px-6 py-4">
                        <DeliveryStatusBadge status={log.delivery_status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.DateTimeFormat("el-GR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(log.created_at))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment?.appointment_at
                          ? new Intl.DateTimeFormat("el-GR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(appointment.appointment_at))
                          : "—"}
                      </td>
                      <td className="px-6 py-4 max-w-[260px] text-sm text-red-600">
                        {log.error_message ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
