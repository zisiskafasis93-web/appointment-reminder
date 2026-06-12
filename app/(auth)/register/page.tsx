import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { isPublicSignupEnabled } from "@/lib/auth/config";

export default function RegisterPage() {
  const signupEnabled = isPublicSignupEnabled();

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="app-panel w-full max-w-md rounded-lg p-8 space-y-6">
        <div>
          <p className="text-sm text-slate-500">RemindMeUp</p>
          <h1 className="text-3xl font-semibold mt-2">
            Δημιουργία λογαριασμού
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Ξεκίνα να οργανώνεις ραντεβού και αυτόματα reminders σε λίγα λεπτά.
          </p>
        </div>

        {signupEnabled ? (
          <RegisterForm />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            Οι νέες εγγραφές είναι κλειστές. Για την ασφαλή χρήση της
            εφαρμογής, ο διαχειριστής δημιουργεί τους λογαριασμούς πρόσβασης.
          </div>
        )}

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
