type AppointmentLike = {
  appointment_at: string;
  duration_minutes: number;
  client_name: string;
  id: string;
  status: AppointmentStatus;
};

export type AppointmentStatus = "scheduled" | "cancelled" | "completed";

export type DayAppointmentItem = {
  id: string;
  clientName: string;
  start: string;
  end: string;
  status: AppointmentStatus;
};

export type DaySlotItem = {
  start: string;
  end: string;
  free: boolean;
  appointmentId?: string;
  clientName?: string;
};

function combineDateAndClock(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function normalizeDayAppointments(
  items: AppointmentLike[]
): DayAppointmentItem[] {
  return items
    .map((item) => {
      const start = new Date(item.appointment_at);
      const end = addMinutes(start, item.duration_minutes);

      return {
        id: item.id,
        clientName: item.client_name,
        start: formatTime(start),
        end: formatTime(end),
        status: item.status,
      };
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function buildDaySlots(params: {
  date: string;
  startTime: string;
  endTime: string;
  slotIntervalMinutes: number;
  appointments: AppointmentLike[];
}) {
  const { date, startTime, endTime, slotIntervalMinutes, appointments } = params;

  const dayStart = combineDateAndClock(date, startTime);
  const dayEnd = combineDateAndClock(date, endTime);

  const normalized = appointments.map((item) => {
    const start = new Date(item.appointment_at);
    const end = addMinutes(start, item.duration_minutes);
    return {
      id: item.id,
      clientName: item.client_name,
      start,
      end,
    };
  });

  const slots: DaySlotItem[] = [];
  let cursor = new Date(dayStart);

  while (cursor < dayEnd) {
    const slotEnd = addMinutes(cursor, slotIntervalMinutes);

    const overlapping = normalized.find(
      (a) => cursor < a.end && slotEnd > a.start
    );

    slots.push({
      start: formatTime(cursor),
      end: formatTime(slotEnd),
      free: !overlapping,
      appointmentId: overlapping?.id,
      clientName: overlapping?.clientName,
    });

    cursor = slotEnd;
  }

  return slots;
}

export function hasOverlap(params: {
  candidateStart: Date;
  durationMinutes: number;
  appointments: Array<{
    id: string;
    appointment_at: string;
    duration_minutes: number;
  }>;
  ignoreAppointmentId?: string;
}) {
  const { candidateStart, durationMinutes, appointments, ignoreAppointmentId } =
    params;

  const candidateEnd = addMinutes(candidateStart, durationMinutes);

  return appointments.some((item) => {
    if (ignoreAppointmentId && item.id === ignoreAppointmentId) {
      return false;
    }

    const existingStart = new Date(item.appointment_at);
    const existingEnd = addMinutes(existingStart, item.duration_minutes);

    return candidateStart < existingEnd && candidateEnd > existingStart;
  });
}
