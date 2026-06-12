import { createClient } from "@/lib/supabase/server";

const AUTO_COMPLETE_DELAY_MINUTES = 60;

export function getAutoCompleteCutoff(now = new Date()) {
  return new Date(now.getTime() - AUTO_COMPLETE_DELAY_MINUTES * 60 * 1000);
}

export async function completeElapsedAppointments(userId: string) {
  const supabase = await createClient();
  const cutoff = getAutoCompleteCutoff();

  await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .lte("appointment_at", cutoff.toISOString());
}
