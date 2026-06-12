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
  defaultReminderChannel: z.literal("sms"),
  defaultReminderOffsetMinutes: z.coerce
    .number()
    .int()
    .positive("Ο χρόνος reminder πρέπει να είναι θετικός"),
  workdayStartTime: z.string().min(1, "Η ώρα έναρξης είναι υποχρεωτική"),
  workdayEndTime: z.string().min(1, "Η ώρα λήξης είναι υποχρεωτική"),
  slotIntervalMinutes: z.coerce
    .number()
    .int()
    .positive("Η διάρκεια slot πρέπει να είναι θετική"),
  reminderSmsBody: z
    .string()
    .trim()
    .min(5, "Το κείμενο SMS είναι πολύ μικρό")
    .max(1000, "Το κείμενο SMS είναι πολύ μεγάλο"),
});
