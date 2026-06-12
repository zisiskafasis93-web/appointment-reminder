import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";
import { BackupDownloadButtons } from "@/components/settings/backup-download-buttons";

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
      "full_name, business_name, default_reminder_channel, default_reminder_offset_minutes, workday_start_time, workday_end_time, slot_interval_minutes, reminder_sms_body"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    return <div>Δεν φορτώθηκαν οι ρυθμίσεις.</div>;
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-sm text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold">Ρυθμίσεις</h1>
        <p className="text-sm text-slate-500 mt-2">
          Όρισε τα βασικά defaults της εφαρμογής για πιο γρήγορη καθημερινή χρήση.
        </p>
      </div>

      <SettingsForm profile={profile} />

      <section className="app-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Backup δεδομένων</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Κατέβασε αντίγραφο των πελατών, των ραντεβού και των βασικών
              ρυθμίσεων. Το JSON είναι το πλήρες backup, ενώ τα CSV ανοίγουν
              εύκολα σε Excel ή Google Sheets.
            </p>
          </div>

          <BackupDownloadButtons />
        </div>
      </section>
    </div>
  );
}
