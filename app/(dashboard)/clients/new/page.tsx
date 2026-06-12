import Link from "next/link";
import { ClientCreateForm } from "@/components/clients/client-create-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Πελάτες</p>
          <h1 className="text-3xl font-semibold">Δημιουργία πελάτη</h1>
          <p className="mt-2 text-sm text-slate-500">
            Πρόσθεσε πελάτη στο πελατολόγιο χωρίς να δημιουργήσεις ραντεβού.
          </p>
        </div>

        <Link
          href="/clients"
          className="secondary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
        >
          Πίσω στους πελάτες
        </Link>
      </div>

      <ClientCreateForm />
    </div>
  );
}
