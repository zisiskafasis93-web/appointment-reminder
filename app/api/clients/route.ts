import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchClientSummaries } from "@/lib/clients/from-appointments";
import { fetchClientSummaries } from "@/lib/clients/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await fetchClientSummaries(supabase, user.id);

  return NextResponse.json({
    clients: query ? searchClientSummaries(clients, query) : clients,
  });
}
