import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditAppointmentForm } from "@/components/appointments/edit-appointment-form";
import { completeElapsedAppointments } from "@/lib/appointments/status";

export default async function AppointmentDetailPage({
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

  await completeElapsedAppointments(user.id);

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-500">Appointments</p>
        <h1 className="text-3xl font-semibold">
          Επεξεργασία ραντεβού
        </h1>
      </div>

      <EditAppointmentForm appointment={appointment} />
    </div>
  );
}
