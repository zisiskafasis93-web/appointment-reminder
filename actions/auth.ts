"use server";

import { redirect } from "next/navigation";
import { isPublicSignupEnabled } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";

type AuthActionState = {
  success: boolean;
  message: string;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function ensureProfile(
  supabase: ServerClient,
  params: {
    userId: string;
    email?: string | null;
    fullName?: string;
    businessName?: string;
  }
) {
  const fullName =
    params.fullName?.trim() || params.email?.split("@")[0] || "Χρήστης";
  const businessName = params.businessName?.trim() || "RemindMeUp";

  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", params.userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingProfile) {
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: params.userId,
    full_name: fullName,
    business_name: businessName,
    default_reminder_channel: "sms",
    default_reminder_offset_minutes: 1440,
    workday_start_time: "09:00",
    workday_end_time: "17:00",
    slot_interval_minutes: 30,
    reminder_email_subject: "Υπενθύμιση ραντεβού",
    reminder_email_body:
      "Γεια σου {client_name}, σου υπενθυμίζουμε το ραντεβού σου στις {appointment_date} {appointment_time}.",
    reminder_sms_body:
      "Σας υπενθυμίζουμε το ραντεβού σας στο {business_name} στις {appointment_date} και ώρα {appointment_time}.",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return {
      success: false,
      message: "Το email και το password είναι υποχρεωτικά.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return {
          success: false,
          message: "Επιβεβαίωσε πρώτα το email σου για να συνδεθείς.",
        };
      }

      return {
        success: false,
        message: `Δεν έγινε σύνδεση: ${error.message}`,
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureProfile(supabase, {
        userId: user.id,
        email: user.email,
        fullName:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : undefined,
        businessName:
          typeof user.user_metadata?.business_name === "string"
            ? user.user_metadata.business_name
            : undefined,
      });
    }
  } catch (authError) {
    return {
      success: false,
      message:
        authError instanceof Error
          ? `Δεν υπάρχει σύνδεση με Supabase: ${authError.message}`
          : "Δεν υπάρχει σύνδεση με Supabase.",
    };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isPublicSignupEnabled()) {
    return {
      success: false,
      message:
        "Οι νέες εγγραφές είναι κλειστές. Ο διαχειριστής δημιουργεί τους λογαριασμούς πρόσβασης.",
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName || !businessName || !email || !password) {
    return {
      success: false,
      message: "Όλα τα πεδία είναι υποχρεωτικά.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: `Supabase error: ${error.message}`,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Δεν δημιουργήθηκε χρήστης.",
      };
    }

    if (!data.session) {
      return {
        success: true,
        message:
          "Η εγγραφή ολοκληρώθηκε. Έλεγξε το email σου για επιβεβαίωση και μετά συνδέσου.",
      };
    }

    await ensureProfile(supabase, {
      userId: data.user.id,
      email,
      fullName,
      businessName,
    });
  } catch (authError) {
    return {
      success: false,
      message:
        authError instanceof Error
          ? `Δεν υπάρχει σύνδεση με Supabase: ${authError.message}`
          : "Δεν υπάρχει σύνδεση με Supabase.",
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      message: "Συμπλήρωσε όλα τα πεδία για να αλλάξει ο κωδικός.",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: "Η επιβεβαίωση δεν ταιριάζει με τον νέο κωδικό.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      message: "Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον τρέχοντα.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return {
      success: false,
      message: "Δεν βρέθηκε ενεργή σύνδεση. Κάνε ξανά σύνδεση και δοκίμασε πάλι.",
    };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return {
      success: false,
      message: "Ο τρέχων κωδικός δεν είναι σωστός.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      message: `Δεν άλλαξε ο κωδικός: ${error.message}`,
    };
  }

  return {
    success: true,
    message: "Ο κωδικός άλλαξε με επιτυχία.",
  };
}
