"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { upsertClientFromContact } from "@/lib/clients/queries";
import { combineDateAndTime, subtractMinutes } from "@/lib/utils/dates";

type ActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createAppointment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    clientId: String(formData.get("clientId") ?? ""),
    clientName: String(formData.get("clientName") ?? ""),
    contactType: String(formData.get("contactType") ?? ""),
    contactValue: String(formData.get("contactValue") ?? ""),
    appointmentDate: String(formData.get("appointmentDate") ?? ""),
    appointmentTime: String(formData.get("appointmentTime") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes") ?? 30),
    notes: String(formData.get("notes") ?? ""),
    reminderChannel: String(formData.get("reminderChannel") ?? "email"),
    reminderOffsetMinutes: Number(formData.get("reminderOffsetMinutes") ?? 1440),
  };

  const parsed = createAppointmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Υπάρχουν λάθη στη φόρμα",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Δεν βρέθηκε ενεργός χρήστης",
    };
  }

  const appointmentAt = combineDateAndTime(
    data.appointmentDate,
    data.appointmentTime
  );

  if (Number.isNaN(appointmentAt.getTime())) {
    return {
      success: false,
      message: "Μη έγκυρη ημερομηνία ή ώρα",
    };
  }

  const reminderScheduledFor = subtractMinutes(
    appointmentAt,
    data.reminderOffsetMinutes
  );

  let clientId = rawData.clientId || null;

  if (!clientId) {
    try {
      clientId = await upsertClientFromContact(supabase, {
        userId: user.id,
        name: data.clientName,
        phone: data.contactValue,
      });
    } catch {}
  }

  const appointmentPayload = {
    user_id: user.id,
    client_id: clientId,
    client_name: data.clientName,
    contact_type: data.contactType,
    contact_value: data.contactValue,
    appointment_at: appointmentAt.toISOString(),
    duration_minutes: data.durationMinutes,
    notes: data.notes || null,
    status: "scheduled",
    reminder_channel: data.reminderChannel,
    reminder_offset_minutes: data.reminderOffsetMinutes,
    reminder_scheduled_for: reminderScheduledFor.toISOString(),
    reminder_status: "pending",
  };

  let { error: insertError } = await supabase
    .from("appointments")
    .insert(appointmentPayload);

  if (insertError && insertError.code === "42703") {
    const { client_id: _clientId, ...fallbackPayload } = appointmentPayload;
    void _clientId;
    const fallback = await supabase.from("appointments").insert(fallbackPayload);
    insertError = fallback.error;
  }

  if (insertError) {
    return {
      success: false,
      message: `DB error: ${insertError.message}`,
    };
  }

  revalidatePath("/appointments");
  revalidatePath("/clients");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Το ραντεβού αποθηκεύτηκε κανονικά",
  };
}

export async function updateAppointment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");

  const rawData = {
    clientId: String(formData.get("clientId") ?? ""),
    clientName: String(formData.get("clientName") ?? ""),
    contactType: String(formData.get("contactType") ?? ""),
    contactValue: String(formData.get("contactValue") ?? ""),
    appointmentDate: String(formData.get("appointmentDate") ?? ""),
    appointmentTime: String(formData.get("appointmentTime") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes") ?? 30),
    notes: String(formData.get("notes") ?? ""),
    reminderChannel: String(formData.get("reminderChannel") ?? "email"),
    reminderOffsetMinutes: Number(formData.get("reminderOffsetMinutes") ?? 1440),
  };

  if (!id) {
    return { success: false, message: "Λείπει το id του ραντεβού" };
  }

  const parsed = createAppointmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Υπάρχουν λάθη στη φόρμα",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "Δεν βρέθηκε ενεργός χρήστης" };
  }

  const { data: existingAppointment, error: existingError } = await supabase
    .from("appointments")
    .select("id, user_id, reminder_status, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existingAppointment) {
    return { success: false, message: "Το ραντεβού δεν βρέθηκε" };
  }

  const appointmentAt = combineDateAndTime(
    data.appointmentDate,
    data.appointmentTime
  );

  if (Number.isNaN(appointmentAt.getTime())) {
    return { success: false, message: "Μη έγκυρη ημερομηνία ή ώρα" };
  }

  const reminderScheduledFor = subtractMinutes(
    appointmentAt,
    data.reminderOffsetMinutes
  );

  let clientId = rawData.clientId || null;

  if (!clientId) {
    try {
      clientId = await upsertClientFromContact(supabase, {
        userId: user.id,
        name: data.clientName,
        phone: data.contactValue,
      });
    } catch {}
  }

  const nextReminderStatus =
    existingAppointment.reminder_status === "sent"
      ? "sent"
      : existingAppointment.reminder_status === "cancelled"
      ? "cancelled"
      : "pending";

  const appointmentUpdatePayload = {
    client_id: clientId,
    client_name: data.clientName,
    contact_type: data.contactType,
    contact_value: data.contactValue,
    appointment_at: appointmentAt.toISOString(),
    duration_minutes: data.durationMinutes,
    notes: data.notes || null,
    reminder_channel: data.reminderChannel,
    reminder_offset_minutes: data.reminderOffsetMinutes,
    reminder_scheduled_for: reminderScheduledFor.toISOString(),
    reminder_status: nextReminderStatus,
    status: existingAppointment.status,
  };

  let { error: updateError } = await supabase
    .from("appointments")
    .update(appointmentUpdatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError && updateError.code === "42703") {
    const { client_id: _clientId, ...fallbackPayload } =
      appointmentUpdatePayload;
    void _clientId;
    const fallback = await supabase
      .from("appointments")
      .update(fallbackPayload)
      .eq("id", id)
      .eq("user_id", user.id);
    updateError = fallback.error;
  }

  if (updateError) {
    return { success: false, message: `DB error: ${updateError.message}` };
  }

  revalidatePath("/appointments");
  revalidatePath("/clients");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/logs");

  return {
    success: true,
    message: "Το ραντεβού ενημερώθηκε κανονικά",
  };
}

export async function cancelAppointment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { success: false, message: "Λείπει το id του ραντεβού" };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "Δεν βρέθηκε ενεργός χρήστης" };
  }

  const { error: cancelError } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      reminder_status: "cancelled",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (cancelError) {
    return { success: false, message: `DB error: ${cancelError.message}` };
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/logs");

  return {
    success: true,
    message: "Το ραντεβού ακυρώθηκε κανονικά",
  };
}
