import "server-only";

type SendSmsParams = {
  to: string;
  text: string;
};

type VonageSmsResponse = {
  messages?: Array<{
    status?: string;
    "message-id"?: string;
    "error-text"?: string;
  }>;
};

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  const withoutSpaces = trimmed.replace(/[\s().-]/g, "");
  let digits = withoutSpaces.startsWith("+")
    ? withoutSpaces.slice(1)
    : withoutSpaces;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (/^69\d{8}$/.test(digits)) {
    digits = `30${digits}`;
  }

  if (!/^\d{7,15}$/.test(digits)) {
    throw new Error("Invalid phone number. Use E.164 format, for example +3069XXXXXXXX.");
  }

  return digits;
}

export async function sendReminderSms({ to, text }: SendSmsParams) {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const from = process.env.VONAGE_FROM ?? "RemindMeUp";

  if (!apiKey) {
    throw new Error("Missing VONAGE_API_KEY env variable");
  }

  if (!apiSecret) {
    throw new Error("Missing VONAGE_API_SECRET env variable");
  }

  const body = new URLSearchParams({
    from,
    to: normalizePhoneNumber(to),
    text,
    type: "unicode",
  });

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const response = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Vonage SMS request failed with status ${response.status}`);
  }

  const data = (await response.json()) as VonageSmsResponse;
  const message = data.messages?.[0];

  if (!message) {
    throw new Error("Vonage SMS response did not include a message result");
  }

  if (message.status !== "0") {
    throw new Error(message["error-text"] ?? `Vonage SMS failed with status ${message.status}`);
  }

  return {
    data,
    messageId: message["message-id"] ?? null,
  };
}
