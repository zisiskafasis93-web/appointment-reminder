import { createClient } from "@/lib/supabase/server";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default async function NewAppointmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Δεν βρέθηκε χρήστης.</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_reminder_channel, default_reminder_offset_minutes")
    .eq("user_id", user.id)
    .single();

  const defaults = {
    reminderChannel: profile?.default_reminder_channel ?? "email",
    reminderOffsetMinutes: profile?.default_reminder_offset_minutes ?? 1440,
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <p className="text-sm text-slate-500">Appointments</p>
        <h1 className="text-3xl font-semibold tracking-tight">Νέο ραντεβού</h1>
        <p className="text-sm text-slate-500 mt-2">
          Καταχώρισε ένα νέο ραντεβού και προγραμμάτισε αυτόματα το reminder.
        </p>
      </div>

      <AppointmentForm defaults={defaults} />
    </div>
  );
}