import "server-only";
import { buildReminderEmail } from "@/lib/reminders/templates";
import { sendReminderEmail } from "@/lib/reminders/send-email";
import { getDueEmailRemindersAdmin } from "@/lib/reminders/admin-queries";
import {
  insertMessageLogAdmin,
  markReminderFailedAdmin,
  markReminderSentAdmin,
} from "@/lib/reminders/admin-mutations";
import { claimReminderForProcessing } from "@/lib/reminders/admin-claim";
import { createAdminClient } from "@/lib/supabase/admin";

export async function processDueRemindersAdmin() {
  const dueAppointments = await getDueEmailRemindersAdmin();
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

    try {
      const { data: profile } = await supabase
  .from("profiles")
  .select("business_name, reminder_email_subject, reminder_email_body, reminder_sms_body")
  .eq("user_id", appointment.user_id)
  .single();
      const emailContent = buildReminderEmail({
  clientName: appointment.client_name,
  appointmentAt: appointment.appointment_at,
  businessName: profile?.business_name ?? null,
  subjectTemplate: profile?.reminder_email_subject ?? "Υπενθύμιση ραντεβού",
  bodyTemplate:
    profile?.reminder_email_body ??
    "Σας υπενθυμίζουμε το ραντεβού σας στο {business_name} στις {appointment_date} και ώρα {appointment_time}.",
});

      const sendResult = await sendReminderEmail({
        to: appointment.contact_value,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      await insertMessageLogAdmin({
        appointmentId: appointment.id,
        userId: appointment.user_id,
        channel: "email",
        recipient: appointment.contact_value,
        subject: emailContent.subject,
        messageBody: emailContent.text,
        provider: "resend",
        providerMessageId: sendResult.data?.id ?? null,
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
          channel: "email",
          recipient: appointment.contact_value,
          subject: "Υπενθύμιση ραντεβού",
          messageBody: "Reminder email failed before final delivery.",
          provider: "resend",
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