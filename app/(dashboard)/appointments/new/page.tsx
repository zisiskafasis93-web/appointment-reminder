import { createClient } from "@/lib/supabase/server";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { getTomorrowDateInputValue } from "@/lib/dates";

export default async function NewAppointmentPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "default_reminder_channel, default_reminder_offset_minutes"
    )
    .eq("user_id", user.id)
    .single();

  const defaults = {
    reminderChannel: profile?.default_reminder_channel ?? "email",
    reminderOffsetMinutes: profile?.default_reminder_offset_minutes ?? 1440,
  };

  const tomorrow = getTomorrowDateInputValue();
  const prefilledDate =
    typeof params.date === "string" && params.date ? params.date : tomorrow;
  const clientId =
    typeof params.clientId === "string" && params.clientId
      ? params.clientId
      : null;
  const { data: initialClient } = clientId
    ? await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("id", clientId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-500">Appointments</p>
        <h1 className="text-3xl font-semibold">Νέο ραντεβού</h1>
        <p className="text-sm text-slate-500 mt-2">
          Καταχώρισε ένα νέο ραντεβού και προγραμμάτισε αυτόματα το reminder.
        </p>
      </div>

      <AppointmentForm
        defaults={defaults}
        prefilledDate={prefilledDate}
        initialClient={initialClient}
      />
    </div>
  );
}
