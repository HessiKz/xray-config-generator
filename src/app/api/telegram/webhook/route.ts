import { NextRequest, NextResponse } from "next/server";
import {
  buildHelpText,
  buildReportStubText,
  buildStatusText,
  isAllowedTelegramUser,
  sendMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

type TelegramUpdate = {
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; first_name?: string; username?: string };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text || !message.chat) {
    return NextResponse.json({ ok: true });
  }

  const userId = message.from?.id;
  if (!isAllowedTelegramUser(userId)) {
    await sendMessage(message.chat.id, "دسترسی ندارید.");
    return NextResponse.json({ ok: true });
  }

  const text = message.text.trim();
  const command = text.split(/\s+/)[0]?.split("@")[0] ?? "";

  try {
    if (command === "/start" || command === "/help") {
      await sendMessage(message.chat.id, buildHelpText());
    } else if (command === "/status") {
      await sendMessage(message.chat.id, buildStatusText());
    } else if (command === "/report") {
      await sendMessage(message.chat.id, buildReportStubText());
    } else {
      await sendMessage(
        message.chat.id,
        "دستور شناخته نشد. /help را بزنید.",
      );
    }
  } catch (err) {
    console.error("telegram handler error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
