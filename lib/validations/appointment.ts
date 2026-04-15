import { z } from "zod";

const emailSchema = z.string().trim().email("Δώσε έγκυρο email");
const greekPhoneSchema = z
  .string()
  .trim()
  .regex(/^(\+30)?6\d{9}$/, "Δώσε έγκυρο κινητό τηλέφωνο");

export const createAppointmentSchema = z
  .object({
    clientName: z
      .string()
      .trim()
      .min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
      .max(100, "Το όνομα είναι πολύ μεγάλο"),
    contactType: z.enum(["email", "phone"]),
    contactValue: z.string().trim().min(1, "Το email ή το κινητό είναι υποχρεωτικό"),
    appointmentDate: z.string().min(1, "Η ημερομηνία είναι υποχρεωτική"),
    appointmentTime: z.string().min(1, "Η ώρα είναι υποχρεωτική"),
    durationMinutes: z.coerce
      .number()
      .int()
      .positive("Η διάρκεια πρέπει να είναι θετικός αριθμός")
      .max(480),
    notes: z.string().trim().max(1000, "Οι σημειώσεις είναι πολύ μεγάλες").optional(),
    reminderChannel: z.enum(["email", "sms"]),
    reminderOffsetMinutes: z.coerce
      .number()
      .int()
      .positive("Ο χρόνος reminder πρέπει να είναι θετικός"),
  })
  .superRefine((data, ctx) => {
    if (data.contactType === "email" && !emailSchema.safeParse(data.contactValue).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactValue"],
        message: "Δώσε έγκυρο email",
      });
    }

    if (data.contactType === "phone" && !greekPhoneSchema.safeParse(data.contactValue).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contactValue"],
        message: "Δώσε έγκυρο κινητό τηλέφωνο",
      });
    }

    if (data.reminderChannel === "sms" && data.contactType !== "phone") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reminderChannel"],
        message: "Για SMS reminder χρειάζεται κινητό",
      });
    }

    if (data.reminderChannel === "email" && data.contactType !== "email") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reminderChannel"],
        message: "Για email reminder χρειάζεται email",
      });
    }
  });