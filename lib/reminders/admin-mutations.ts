import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markReminderSentAdmin(appointmentId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("appointments")
    .update({
      reminder_status: "sent",
      reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("reminder_status", "processing");

  if (error) {
    throw new Error(`Failed to mark reminder sent: ${error.message}`);
  }
}

export async function markReminderFailedAdmin(appointmentId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("appointments")
    .update({
      reminder_status: "failed",
    })
    .eq("id", appointmentId)
    .eq("reminder_status", "processing");

  if (error) {
    throw new Error(`Failed to mark reminder failed: ${error.message}`);
  }
}

type InsertMessageLogParams = {
  appointmentId: string;
  userId: string;
  channel: "email" | "sms";
  recipient: string;
  subject?: string | null;
  messageBody: string;
  provider?: string | null;
  providerMessageId?: string | null;
  deliveryStatus: "queued" | "sent" | "failed";
  errorMessage?: string | null;
};

export async function insertMessageLogAdmin(params: InsertMessageLogParams) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("message_logs").insert({
    appointment_id: params.appointmentId,
    user_id: params.userId,
    channel: params.channel,
    recipient: params.recipient,
    subject: params.subject ?? null,
    message_body: params.messageBody,
    provider: params.provider ?? null,
    provider_message_id: params.providerMessageId ?? null,
    delivery_status: params.deliveryStatus,
    error_message: params.errorMessage ?? null,
  });

  if (error) {
    throw new Error(`Failed to insert message log: ${error.message}`);
  }
}