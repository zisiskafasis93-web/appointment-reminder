type ReminderTemplateParams = {
  clientName: string;
  appointmentAt: string;
  businessName?: string | null;
};

export function renderReminderTemplate(
  template: string,
  params: ReminderTemplateParams
) {
  const date = new Intl.DateTimeFormat("el-GR", {
    dateStyle: "medium",
  }).format(new Date(params.appointmentAt));

  const time = new Intl.DateTimeFormat("el-GR", {
    timeStyle: "short",
  }).format(new Date(params.appointmentAt));

  return template
    .replaceAll("{client_name}", params.clientName)
    .replaceAll("{appointment_date}", date)
    .replaceAll("{appointment_time}", time)
    .replaceAll("{business_name}", params.businessName ?? "");
}