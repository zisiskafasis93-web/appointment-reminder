import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  if (!from) {
    throw new Error("Missing REMINDER_FROM_EMAIL env variable");
  }

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