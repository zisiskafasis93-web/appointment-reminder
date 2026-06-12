import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchClientSummaries } from "@/lib/clients/queries";
import { ClientSummary } from "@/lib/clients/from-appointments";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Δεν βρέθηκε χρήστης.</div>;
  }

  const search = typeof params.search === "string" ? params.search.trim() : "";

  let errorMessage = "";
  let clientSummaries: ClientSummary[] = [];

  try {
    clientSummaries = await fetchClientSummaries(supabase, user.id);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Δεν φορτώθηκαν οι πελάτες.";
  }

  const clients = clientSummaries.filter((client) => {
    if (!search) {
      return true;
    }

    const normalizedSearch = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(normalizedSearch) ||
      client.phone.includes(normalizedSearch)
    );
  });

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Clients</p>
          <h1 className="text-3xl font-semibold">Πελάτες</h1>
          <p className="mt-2 text-sm text-slate-500">
            Γρήγορη εικόνα πελατών από το ιστορικό ραντεβού και τα στοιχεία
            επικοινωνίας τους.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/clients/new"
            className="primary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
          >
            + Νέος πελάτης
          </Link>
          <Link
            href="/appointments/new"
            className="secondary-action inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium"
          >
            + Νέο ραντεβού
          </Link>
        </div>
      </div>

      <form className="app-panel rounded-lg p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Αναζήτηση με όνομα ή κινητό"
            className="w-full rounded-lg border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="secondary-action rounded-lg px-4 py-3 text-sm font-medium"
          >
            Αναζήτηση
          </button>
        </div>
      </form>

      <div className="app-panel overflow-hidden rounded-lg">
        {errorMessage ? (
          <div className="p-6 text-sm text-red-600">
            Δεν φορτώθηκαν οι πελάτες.
          </div>
        ) : !clients.length ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-medium">Δεν βρέθηκαν πελάτες</h2>
            <p className="mt-2 text-sm text-slate-500">
              Οι πελάτες θα εμφανίζονται εδώ μόλις τους δημιουργήσεις ή μόλις
              περάσεις ραντεβού.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head text-left">
                <tr>
                  <th className="px-6 py-4 font-medium">Πελάτης</th>
                  <th className="px-6 py-4 font-medium">Κινητό</th>
                  <th className="px-6 py-4 font-medium">Ραντεβού</th>
                  <th className="px-6 py-4 font-medium">Τελευταίο</th>
                  <th className="px-6 py-4 font-medium">Επόμενο</th>
                  <th className="px-6 py-4 font-medium text-right">Καρτέλα</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={`${client.name}-${client.phone}`}
                    className="border-t border-slate-200/80 align-top hover:bg-white/70"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div>
                        {client.id ? (
                          <Link
                            href={`/clients/${client.id}`}
                            className="underline underline-offset-4"
                          >
                            {client.name}
                          </Link>
                        ) : (
                          client.name
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4">{client.appointmentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat("el-GR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(client.lastAppointmentAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.nextAppointmentAt
                        ? new Intl.DateTimeFormat("el-GR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(client.nextAppointmentAt))
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {client.id ? (
                        <Link
                          href={`/clients/${client.id}`}
                          className="primary-action inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium"
                        >
                          Άνοιγμα
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
