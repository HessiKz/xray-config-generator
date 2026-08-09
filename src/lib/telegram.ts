const TELEGRAM_API = "https://api.telegram.org";

export function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

export async function telegramCall<T>(
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const token = getBotToken();
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json()) as T & { ok?: boolean; description?: string };
  if (!res.ok || (data as { ok?: boolean }).ok === false) {
    throw new Error(
      (data as { description?: string }).description ||
        `Telegram API ${method} failed`,
    );
  }
  return data;
}

export async function sendMessage(chatId: number | string, text: string) {
  return telegramCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
}

export function isAllowedTelegramUser(userId: number | undefined): boolean {
  const raw = process.env.TELEGRAM_ALLOWED_USER_IDS?.trim();
  if (!raw) return true;
  if (userId == null) return false;
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(String(userId));
}

export function buildHelpText(): string {
  return [
    "<b>سامانه عملیات فریمان</b>",
    "",
    "دستورات فعلی:",
    "/start — شروع",
    "/help — راهنما",
    "/status — وضعیت سامانه",
    "/report — خلاصه گزارش روزانه (نسخه اولیه)",
    "",
    "به‌زودی: کشتارکن‌ها، انبار، سردخانه، خرید/فروش از انعکاس.",
  ].join("\n");
}

export function buildStatusText(): string {
  return [
    "<b>وضعیت</b>",
    "• وب: آنلاین (Vercel)",
    "• ربات تلگرام: فعال",
    "• همگام‌سازی انعکاس: هنوز متصل نشده",
    "• گزارش روزانه انبار: در حال آماده‌سازی",
  ].join("\n");
}

export function buildReportStubText(): string {
  return [
    "<b>گزارش روزانه — پیش‌نمایش</b>",
    "تاریخ: به‌زودی از انعکاس پر می‌شود",
    "",
    "• کشتار امروز: —",
    "• خرید / فروش: —",
    "• موجودی سردخانه ۱۸-: —",
    "• مغایرت انبار: —",
    "",
    "<i>این پیام تأیید می‌کند ربات و هاست آماده‌اند.</i>",
  ].join("\n");
}
