"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateSettingsSchema } from "@/lib/validations/settings";

type ActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    fullName: String(formData.get("fullName") ?? ""),
    businessName: String(formData.get("businessName") ?? ""),
    defaultReminderChannel: String(formData.get("defaultReminderChannel") ?? "email"),
    defaultReminderOffsetMinutes: Number(
      formData.get("defaultReminderOffsetMinutes") ?? 1440
    ),
  };

  const parsed = updateSettingsSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Υπάρχουν λάθη στη φόρμα ρυθμίσεων",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

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

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      business_name: parsed.data.businessName,
      default_reminder_channel: parsed.data.defaultReminderChannel,
      default_reminder_offset_minutes: parsed.data.defaultReminderOffsetMinutes,
    })
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: `DB error: ${error.message}`,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/appointments/new");

  return {
    success: true,
    message: "Οι ρυθμίσεις αποθηκεύτηκαν κανονικά",
  };
}