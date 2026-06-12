import "server-only";
import { Resend } from "resend";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendReminderEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams) {
  const from = process.env.REMINDER_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!from) {
    throw new Error("Missing REMINDER_FROM_EMAIL env variable");
  }

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY env variable");
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { data };
}
