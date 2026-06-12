import { SupabaseClient } from "@supabase/supabase-js";
import {
  buildClientSummaries,
  ClientSummary,
} from "@/lib/clients/from-appointments";

type ClientRecord = {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
};

function isMissingClientsTable(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.message?.toLowerCase().includes("clients")
  );
}

function getClientKey(name: string, phone: string) {
  return `${name.trim().toLowerCase()}|${phone.trim()}`;
}

export async function upsertClientFromContact(
  supabase: SupabaseClient,
  params: {
    userId: string;
    name: string;
    phone: string;
  }
) {
  const name = params.name.trim();
  const phone = params.phone.trim();

  if (!name || !phone) {
    return null;
  }

  const { data: existingClient, error: existingError } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", params.userId)
    .eq("name", name)
    .eq("phone", phone)
    .maybeSingle();

  if (existingError) {
    if (isMissingClientsTable(existingError)) {
      return null;
    }

    throw new Error(existingError.message);
  }

  if (existingClient?.id) {
    return existingClient.id as string;
  }

  const { data: insertedClient, error: insertError } = await supabase
    .from("clients")
    .insert({
      user_id: params.userId,
      name,
      phone,
    })
    .select("id")
    .single();

  if (insertError) {
    if (isMissingClientsTable(insertError)) {
      return null;
    }

    throw new Error(insertError.message);
  }

  return insertedClient?.id as string | null;
}

export async function fetchClientSummaries(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, client_name, contact_value, appointment_at, status")
    .eq("user_id", userId)
    .order("appointment_at", { ascending: false })
    .limit(1000);

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const summaries = buildClientSummaries(
    (appointments ?? []) as Parameters<typeof buildClientSummaries>[0]
  );

  await Promise.all(
    summaries.map((client) =>
      upsertClientFromContact(supabase, {
        userId,
        name: client.name,
        phone: client.phone,
      }).catch(() => null)
    )
  );

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, phone, notes")
    .eq("user_id", userId);

  if (clientsError) {
    if (isMissingClientsTable(clientsError)) {
      return summaries;
    }

    throw new Error(clientsError.message);
  }

  return mergeClientRecords(summaries, clients ?? []);
}

function mergeClientRecords(
  summaries: ClientSummary[],
  clientRecords: ClientRecord[]
) {
  const byKey = new Map<string, ClientRecord>();

  for (const client of clientRecords) {
    byKey.set(getClientKey(client.name, client.phone), client);
  }

  const merged = summaries.map((summary) => {
    const record = byKey.get(getClientKey(summary.name, summary.phone));

    if (!record) {
      return summary;
    }

    return {
      ...summary,
      id: record.id,
      notes: record.notes?.trim() || summary.notes,
    };
  });

  const summaryKeys = new Set(
    summaries.map((summary) => getClientKey(summary.name, summary.phone))
  );

  for (const record of clientRecords) {
    const key = getClientKey(record.name, record.phone);

    if (summaryKeys.has(key)) {
      continue;
    }

    merged.push({
      id: record.id,
      name: record.name,
      phone: record.phone,
      appointmentCount: 0,
      lastAppointmentAt: new Date().toISOString(),
      nextAppointmentAt: null,
      lastStatus: "completed",
      notes: record.notes,
    });
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name, "el"));
}

export async function fetchClientDetail(
  supabase: SupabaseClient,
  params: {
    userId: string;
    clientId: string;
  }
) {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, phone, notes")
    .eq("id", params.clientId)
    .eq("user_id", params.userId)
    .single();

  if (clientError || !client) {
    return null;
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, client_name, contact_value, appointment_at, status")
    .eq("user_id", params.userId)
    .eq("client_id", params.clientId)
    .order("appointment_at", { ascending: false });

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const { data: legacyAppointments, error: legacyError } = await supabase
    .from("appointments")
    .select("id, client_name, contact_value, appointment_at, status")
    .eq("user_id", params.userId)
    .eq("client_name", client.name)
    .eq("contact_value", client.phone)
    .is("client_id", null)
    .order("appointment_at", { ascending: false });

  if (legacyError && legacyError.code !== "42703") {
    throw new Error(legacyError.message);
  }

  return {
    client,
    appointments: [...(appointments ?? []), ...(legacyAppointments ?? [])],
  };
}
