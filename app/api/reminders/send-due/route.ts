import { NextRequest, NextResponse } from "next/server";
import { processDueRemindersAdmin } from "@/lib/reminders/process-due-admin";

function isAuthorizedCronRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (expectedSecret && authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }

  return process.env.VERCEL === "1" && userAgent.includes("vercel-cron/1.0");
}

async function handleReminderRun(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueRemindersAdmin();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleReminderRun(request);
}

export async function POST(request: NextRequest) {
  return handleReminderRun(request);
}
