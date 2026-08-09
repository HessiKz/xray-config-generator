import { NextRequest, NextResponse } from "next/server";
import {
  buildHelpText,
  isAllowedTelegramUser,
  sendMessage,
} from "@/lib/telegram";
import {
  answerTelegramQuestion,
  buildLiveReportText,
  buildLiveStatusText,
} from "@/server/telegram-qa";
import { prisma } from "@/server/db";

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

  try {
    await prisma.telegramChat.upsert({
      where: { chatId: String(message.chat.id) },
      create: {
        chatId: String(message.chat.id),
        username: message.from?.username || null,
      },
      update: { username: message.from?.username || null },
    });
  } catch (err) {
    console.error("telegram chat upsert", err);
  }

  const text = message.text.trim();
  const command = text.split(/\s+/)[0]?.split("@")[0] ?? "";

  try {
    let reply: string;
    if (command === "/start" || command === "/help") {
      reply = buildHelpText();
    } else if (command === "/status") {
      reply = await buildLiveStatusText();
    } else if (command === "/report") {
      const day = text.split(/\s+/)[1] || "1405/05/01";
      reply = await buildLiveReportText(day);
    } else if (command.startsWith("/")) {
      reply = "دستور شناخته نشد. /help را بزنید.";
    } else {
      reply = await answerTelegramQuestion(text);
    }
    try {
      await sendMessage(message.chat.id, reply);
    } catch (sendErr) {
      // Chat may be synthetic in tests; keep webhook 200 so Telegram does not retry storm.
      console.error("telegram sendMessage error", sendErr);
      return NextResponse.json({
        ok: true,
        delivered: false,
        preview: reply.slice(0, 500),
      });
    }
  } catch (err) {
    console.error("telegram handler error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
