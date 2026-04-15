import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm space-y-6">
        <div>
          <p className="text-sm text-slate-500">Appointment Reminder</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Δημιουργία λογαριασμού
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Ξεκίνα να οργανώνεις ραντεβού και αυτόματα reminders σε λίγα λεπτά.
          </p>
        </div>

        <RegisterForm />

        <p className="text-sm text-slate-500">
          Έχεις ήδη λογαριασμό;{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
          >
            Σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}