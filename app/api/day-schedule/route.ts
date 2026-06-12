import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeElapsedAppointments } from "@/lib/appointments/status";
import { buildDaySlots, normalizeDayAppointments } from "@/lib/schedule/slots";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await completeElapsedAppointments(user.id);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("workday_start_time, workday_end_time, slot_interval_minutes")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, client_name, appointment_at, duration_minutes, status")
    .eq("user_id", user.id)
    .gte("appointment_at", startOfDay)
    .lte("appointment_at", endOfDay)
    .order("appointment_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    appointments: normalizeDayAppointments(appointments ?? []),
    slots: buildDaySlots({
      date,
      startTime: profile.workday_start_time,
      endTime: profile.workday_end_time,
      slotIntervalMinutes: profile.slot_interval_minutes,
      appointments: (appointments ?? []).filter(
        (appointment) => appointment.status !== "cancelled"
      ),
    }),
    settings: {
      workdayStartTime: profile.workday_start_time,
      workdayEndTime: profile.workday_end_time,
      slotIntervalMinutes: profile.slot_interval_minutes,
    },
  });
}
