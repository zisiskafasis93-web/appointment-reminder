import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm space-y-6">
        <div>
          <p className="text-sm text-slate-500">Appointment Reminder</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Σύνδεση
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Μπες στην εφαρμογή για να διαχειριστείς ραντεβού και reminders.
          </p>
        </div>

        <LoginForm />

        <p className="text-sm text-slate-500">
          Δεν έχεις λογαριασμό;{" "}
          <Link
            href="/register"
            className="font-medium underline underline-offset-4"
          >
            Κάνε εγγραφή
          </Link>
        </p>
      </div>
    </div>
  );
}