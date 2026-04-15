import { z } from "zod";

export const updateSettingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(100, "Το όνομα είναι πολύ μεγάλο"),
  businessName: z
    .string()
    .trim()
    .min(2, "Το όνομα επιχείρησης πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(120, "Το όνομα επιχείρησης είναι πολύ μεγάλο"),
  defaultReminderChannel: z.enum(["email", "sms"]),
  defaultReminderOffsetMinutes: z.coerce
    .number()
    .int()
    .positive("Ο χρόνος reminder πρέπει να είναι θετικός"),
});