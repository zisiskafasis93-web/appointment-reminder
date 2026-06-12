import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { isPublicSignupEnabled } from "@/lib/auth/config";

export default function LoginPage() {
  const signupEnabled = isPublicSignupEnabled();

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-6">
      <div className="app-panel w-full max-w-md rounded-lg p-8 space-y-6">
        <div>
          <p className="text-sm text-slate-500">RemindMeUp</p>
          <h1 className="text-3xl font-semibold mt-2">
            Σύνδεση
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Μπες στην εφαρμογή για να διαχειριστείς ραντεβού και reminders.
          </p>
        </div>

        <LoginForm />

        {signupEnabled ? (
          <p className="text-sm text-slate-500">
            Δεν έχεις λογαριασμό;{" "}
            <Link
              href="/register"
              className="font-medium underline underline-offset-4"
            >
              Κάνε εγγραφή
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
