import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AnyRecord = Record<string, unknown>;

const CSV_FORMATS = new Set(["appointments-csv", "clients-csv"]);

function omitUserId<T extends AnyRecord>(record: T) {
  const { user_id: _userId, ...rest } = record;
  void _userId;
  return rest;
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function jsonResponse(data: unknown, filename: string) {
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvResponse(rows: AnyRecord[], filename: string) {
  const headers = Array.from(
    rows.reduce((allHeaders, row) => {
      Object.keys(row).forEach((key) => allHeaders.add(key));
      return allHeaders;
    }, new Set<string>())
  );

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function fetchOptionalRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  userId: string
) {
  let query = supabase
    .from(table)
    .select("*")
    .eq("user_id", userId);

  if (table === "appointments") {
    query = query.order("appointment_at", { ascending: true });
  }

  if (table === "clients") {
    query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return {
      rows: [] as AnyRecord[],
      error: error.message,
    };
  }

  return {
    rows: (data ?? []) as AnyRecord[],
    error: null,
  };
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "backup-json";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile, error: profileError }, appointmentsResult, clientsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      fetchOptionalRows(supabase, "appointments", user.id),
      fetchOptionalRows(supabase, "clients", user.id),
    ]);

  if (profileError || !profile) {
    return NextResponse.json(
      { error: profileError?.message ?? "Profile not found" },
      { status: 400 }
    );
  }

  const timestamp = getTimestamp();
  const appointments = appointmentsResult.rows.map(omitUserId);
  const clients = clientsResult.rows.map(omitUserId);

  if (format === "appointments-csv") {
    return csvResponse(
      appointments,
      `remindmeup-appointments-${timestamp}.csv`
    );
  }

  if (format === "clients-csv") {
    return csvResponse(clients, `remindmeup-clients-${timestamp}.csv`);
  }

  if (format !== "backup-json" && !CSV_FORMATS.has(format)) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  return jsonResponse(
    {
      app: "RemindMeUp",
      exported_at: new Date().toISOString(),
      format_version: 1,
      data: {
        profile: omitUserId(profile as AnyRecord),
        clients,
        appointments,
      },
      warnings: {
        clients: clientsResult.error,
        appointments: appointmentsResult.error,
      },
    },
    `remindmeup-backup-${timestamp}.json`
  );
}
