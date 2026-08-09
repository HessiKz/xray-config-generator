# سامانه عملیات فریمان (Fariman Ops)

لایه عملیاتی زنجیره گوشت فریمان. سامانه حسابداری انعکاس فقط به‌صورت read-only منبع داده است.

## توسعه محلی

```bash
npm install
cp .env.example .env.local
npm run dev
```

## متغیرهای محیطی (Vercel)

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_ALLOWED_USER_IDS` (اختیاری)

هرگز توکن را در گیت commit نکنید.

## ربات تلگرام

Webhook: `POST /api/telegram/webhook`

دستورات فعلی: `/start` `/help` `/status` `/report`
