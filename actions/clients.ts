"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  success: boolean;
  message: string;
};

export async function createClientRecord(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    return {
      success: false,
      message: "Συμπλήρωσε όνομα και κινητό.",
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
      message: "Δεν βρέθηκε ενεργός χρήστης.",
    };
  }

  const { data: existingClient, error: existingError } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", name)
    .eq("phone", phone)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      message: `DB error: ${existingError.message}`,
    };
  }

  if (existingClient?.id) {
    return {
      success: false,
      message: "Υπάρχει ήδη πελάτης με αυτό το όνομα και κινητό.",
    };
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name,
      phone,
    })
    .select("id")
    .single();

  if (error || !client?.id) {
    return {
      success: false,
      message: `DB error: ${error?.message ?? "Δεν δημιουργήθηκε ο πελάτης."}`,
    };
  }

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientNotes(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) {
    return {
      success: false,
      message: "Λείπει ο πελάτης.",
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
      message: "Δεν βρέθηκε ενεργός χρήστης.",
    };
  }

  const { error } = await supabase
    .from("clients")
    .update({ notes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      message: `DB error: ${error.message}`,
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);

  return {
    success: true,
    message: "Οι σημειώσεις αποθηκεύτηκαν.",
  };
}
