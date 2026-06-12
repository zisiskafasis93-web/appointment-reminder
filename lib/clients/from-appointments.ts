type AppointmentClientSource = {
  id: string;
  client_name: string;
  contact_value: string;
  appointment_at: string;
  status: "scheduled" | "cancelled" | "completed";
};

export type ClientSummary = {
  id: string | null;
  name: string;
  phone: string;
  appointmentCount: number;
  lastAppointmentAt: string;
  nextAppointmentAt: string | null;
  lastStatus: "scheduled" | "cancelled" | "completed";
  notes: string | null;
};

function getClientKey(item: AppointmentClientSource) {
  return `${item.client_name.trim().toLowerCase()}|${item.contact_value.trim()}`;
}

export function buildClientSummaries(items: AppointmentClientSource[]) {
  const now = new Date();
  const clients = new Map<string, ClientSummary>();

  for (const item of items) {
    const name = item.client_name.trim();
    const phone = item.contact_value.trim();

    if (!name || !phone) {
      continue;
    }

    const key = getClientKey(item);
    const appointmentAt = new Date(item.appointment_at);
    const existing = clients.get(key);

    if (!existing) {
      clients.set(key, {
        id: null,
        name,
        phone,
        appointmentCount: 1,
        lastAppointmentAt: item.appointment_at,
        nextAppointmentAt:
          appointmentAt >= now && item.status === "scheduled"
            ? item.appointment_at
            : null,
        lastStatus: item.status,
        notes: null,
      });
      continue;
    }

    const lastAppointmentAt = new Date(existing.lastAppointmentAt);
    const nextAppointmentAt = existing.nextAppointmentAt
      ? new Date(existing.nextAppointmentAt)
      : null;

    existing.appointmentCount += 1;

    if (appointmentAt > lastAppointmentAt) {
      existing.lastAppointmentAt = item.appointment_at;
      existing.lastStatus = item.status;
    }

    if (
      appointmentAt >= now &&
      item.status === "scheduled" &&
      (!nextAppointmentAt || appointmentAt < nextAppointmentAt)
    ) {
      existing.nextAppointmentAt = item.appointment_at;
    }
  }

  return Array.from(clients.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "el")
  );
}

export function searchClientSummaries(
  clients: ClientSummary[],
  query: string,
  limit = 8
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.phone.includes(normalizedQuery)
    )
    .slice(0, limit);
}
