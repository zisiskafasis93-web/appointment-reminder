type BuildReminderEmailParams = {
  clientName: string;
  appointmentAt: string;
  businessName?: string | null;
};

export function buildReminderEmail({
  clientName,
  appointmentAt,
  businessName,
}: BuildReminderEmailParams) {
  const formattedDate = new Intl.DateTimeFormat("el-GR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(appointmentAt));

  const subject = "Υπενθύμιση ραντεβού";

  const text = `Καλησπέρα ${clientName},

σας υπενθυμίζουμε το ραντεβού σας ${businessName ? `με το ${businessName}` : ""} στις ${formattedDate}.

Αν δεν μπορείτε να παρευρεθείτε, παρακαλούμε επικοινωνήστε μαζί μας.

Ευχαριστούμε.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>Καλησπέρα ${escapeHtml(clientName)},</p>
      <p>
        Σας υπενθυμίζουμε το ραντεβού σας
        ${businessName ? ` με το <strong>${escapeHtml(businessName)}</strong>` : ""}
        στις <strong>${formattedDate}</strong>.
      </p>
      <p>Αν δεν μπορείτε να παρευρεθείτε, παρακαλούμε επικοινωνήστε μαζί μας.</p>
      <p>Ευχαριστούμε.</p>
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