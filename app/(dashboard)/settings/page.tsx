import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Δεν βρέθηκε χρήστης.</div>;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "full_name, business_name, default_reminder_channel, default_reminder_offset_minutes"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    return <div>Δεν φορτώθηκαν οι ρυθμίσεις.</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <p className="text-sm text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ρυθμίσεις</h1>
        <p className="text-sm text-slate-500 mt-2">
          Όρισε τα βασικά defaults της εφαρμογής για πιο γρήγορη καθημερινή χρήση.
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}