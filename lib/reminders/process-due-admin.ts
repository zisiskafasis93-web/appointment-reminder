import "server-only";
import { getDueSmsRemindersAdmin } from "@/lib/reminders/admin-queries";
import { sendReminderSms } from "@/lib/reminders/send-sms";
import { renderReminderTemplate } from "@/lib/reminders/render-template";
import {
  insertMessageLogAdmin,
  markReminderFailedAdmin,
  markReminderSentAdmin,
} from "@/lib/reminders/admin-mutations";
import { claimReminderForProcessing } from "@/lib/reminders/admin-claim";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_SMS_BODY =
  "Σας υπενθυμίζουμε το ραντεβού σας στο {business_name} στις {appointment_date} και ώρα {appointment_time}.";

export async function processDueRemindersAdmin() {
  const dueAppointments = await getDueSmsRemindersAdmin();
  const supabase = createAdminClient();

  const results: Array<{
    appointmentId: string;
    success: boolean;
    skipped?: boolean;
    error?: string;
  }> = [];

  for (const appointment of dueAppointments) {
    const claimed = await claimReminderForProcessing(appointment.id);

    if (!claimed) {
      results.push({
        appointmentId: appointment.id,
        success: false,
        skipped: true,
        error: "Reminder already claimed by another process",
      });
      continue;
    }

    let smsText = "Reminder SMS failed before final delivery.";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name, reminder_sms_body")
        .eq("user_id", appointment.user_id)
        .single();

      smsText = renderReminderTemplate(
        profile?.reminder_sms_body?.trim() || DEFAULT_SMS_BODY,
        {
          clientName: appointment.client_name,
          appointmentAt: appointment.appointment_at,
          businessName: profile?.business_name ?? null,
        }
      );

      const sendResult = await sendReminderSms({
        to: appointment.contact_value,
        text: smsText,
      });

      await insertMessageLogAdmin({
        appointmentId: appointment.id,
        userId: appointment.user_id,
        channel: "sms",
        recipient: appointment.contact_value,
        messageBody: smsText,
        provider: "vonage",
        providerMessageId: sendResult.messageId,
        deliveryStatus: "sent",
      });

      await markReminderSentAdmin(appointment.id);

      results.push({
        appointmentId: appointment.id,
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      try {
        await insertMessageLogAdmin({
          appointmentId: appointment.id,
          userId: appointment.user_id,
          channel: "sms",
          recipient: appointment.contact_value,
          messageBody: smsText,
          provider: "vonage",
          deliveryStatus: "failed",
          errorMessage: message,
        });
      } catch {}

      try {
        await markReminderFailedAdmin(appointment.id);
      } catch {}

      results.push({
        appointmentId: appointment.id,
        success: false,
        error: message,
      });
    }
  }

  return {
    processed: dueAppointments.length,
    results,
  };
}
