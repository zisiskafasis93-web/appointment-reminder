import { renderReminderTemplate } from "@/lib/reminders/render-template";

type BuildReminderEmailParams = {
  clientName: string;
  appointmentAt: string;
  businessName?: string | null;
  subjectTemplate: string;
  bodyTemplate: string;
};

export function buildReminderEmail({
  clientName,
  appointmentAt,
  businessName,
  subjectTemplate,
  bodyTemplate,
}: BuildReminderEmailParams) {
  const subject = renderReminderTemplate(subjectTemplate, {
    clientName,
    appointmentAt,
    businessName,
  });

  const text = renderReminderTemplate(bodyTemplate, {
    clientName,
    appointmentAt,
    businessName,
  });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; white-space: pre-line;">
      ${escapeHtml(text).replace(/\n/g, "<br />")}
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}