import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function claimReminderForProcessing(appointmentId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({ reminder_status: "processing" })
    .eq("id", appointmentId)
    .eq("reminder_status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to claim reminder: ${error.message}`);
  }

  return Boolean(data);
}