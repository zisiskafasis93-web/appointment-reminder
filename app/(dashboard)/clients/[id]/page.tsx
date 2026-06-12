import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchClientDetail } from "@/lib/clients/queries";
import { ClientNotesForm } from "@/components/clients/client-notes-form";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const detail = await fetchClientDetail(supabase, {
    userId: user.id,
    clientId: id,
  });

  if (!detail) {
    notFound();
  }

  const { client, appointments } = detail;
  const nextAppointment = appointments
    .filter(
      (appointment) =>
        appointment.status === "scheduled" &&
        new Date(appointment.appointment_at) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.appointment_at).getTime() -
        new Date(b.appointment_at).getTime()
    )[0];

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Πελάτης</p>
          <h1 className="text-3xl font-semibold">{client.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {client.phone} · Καρτέλα σημειώσεων και ιστορικού
          </p>
        </div>

        <Link
          href={`/appointments/new?clientId=${client.id}`}
          className="primary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
        >
          + Νέο ραντεβού
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-panel rounded-lg p-5">
          <p className="text-sm text-slate-500">Σύνολο ραντεβού</p>
          <p className="mt-3 text-3xl font-semibold">{appointments.length}</p>
        </div>

        <div className="app-panel rounded-lg p-5">
          <p className="text-sm text-slate-500">Επόμενο ραντεβού</p>
          <p className="mt-3 text-base font-semibold">
            {nextAppointment
              ? new Intl.DateTimeFormat("el-GR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(nextAppointment.appointment_at))
              : "-"}
          </p>
        </div>

        <div className="app-panel rounded-lg p-5">
          <p className="text-sm text-slate-500">Κινητό</p>
          <p className="mt-3 text-base font-semibold">{client.phone}</p>
        </div>
      </section>

      <ClientNotesForm clientId={client.id} notes={client.notes ?? ""} />

      <section className="app-panel overflow-hidden rounded-lg">
        <div className="table-head border-b border-[#e7e2ef] px-6 py-5">
          <h2 className="text-lg font-semibold">Ιστορικό ραντεβού</h2>
        </div>

        {!appointments.length ? (
          <div className="p-8 text-sm text-slate-500">
            Δεν υπάρχουν ακόμα ραντεβού για αυτόν τον πελάτη.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head text-left">
                <tr>
                  <th className="px-6 py-4 font-medium">Ημερομηνία</th>
                  <th className="px-6 py-4 font-medium">Κατάσταση</th>
                  <th className="px-6 py-4 font-medium text-right">Ενέργεια</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-slate-200/80 align-top hover:bg-white/70"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat("el-GR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(appointment.appointment_at))}
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/appointments/${appointment.id}`}
                        className="font-medium underline underline-offset-4"
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
      </section>
    </div>
  );
}
