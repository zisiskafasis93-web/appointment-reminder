import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const [
    appointmentsTodayRes,
    upcomingAppointmentsRes,
    pendingRemindersRes,
    sentTodayRes,
    failedRemindersRes,
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .gte("appointment_at", startOfToday.toISOString())
      .lt("appointment_at", endOfToday.toISOString()),

    supabase
      .from("appointments")
      .select(
        "id, client_name, appointment_at, reminder_status, reminder_channel"
      )
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .gte("appointment_at", now.toISOString())
      .order("appointment_at", { ascending: true })
      .limit(5),

    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .eq("reminder_status", "pending"),

    supabase
      .from("message_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("delivery_status", "sent")
      .gte("created_at", startOfToday.toISOString())
      .lt("created_at", endOfToday.toISOString()),

    supabase
      .from("message_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("delivery_status", "failed"),
  ]);

  return {
    appointmentsToday: appointmentsTodayRes.count ?? 0,
    upcomingAppointments: upcomingAppointmentsRes.data ?? [],
    pendingReminders: pendingRemindersRes.count ?? 0,
    remindersSentToday: sentTodayRes.count ?? 0,
    failedReminders: failedRemindersRes.count ?? 0,
  };
}