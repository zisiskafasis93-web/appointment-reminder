import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getDueSmsRemindersAdmin() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      user_id,
      client_name,
      contact_type,
      contact_value,
      appointment_at,
      reminder_channel,
      reminder_status,
      reminder_scheduled_for
    `)
    .eq("status", "scheduled")
    .eq("reminder_status", "pending")
    .eq("reminder_channel", "sms")
    .eq("contact_type", "phone")
    .lte("reminder_scheduled_for", now)
    .order("reminder_scheduled_for", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch due reminders: ${error.message}`);
  }

  return data ?? [];
}
