# Runbook — سامانه عملیات فریمان

## نقش‌ها
| نقش | دسترسی |
|-----|--------|
| ceo | داشبورد، گزارش‌ها، سردخانه match، پیشنهادها، sync |
| warehouse_manager | انبار، شمارش، سردخانه ثبت |
| operator | مشاهده گزارش‌ها |
| admin | همه + کاربران/audit/sync |

## Seed محلی
```bash
npm run db:seed
```
کاربران پیش‌فرض: `ceo/ceo1234`, `warehouse/wh1234`, `admin/admin1234`

## Sync انعکاس (فقط خواندنی)
```bash
# با سشن ادمین/مدیرعامل از UI، یا:
curl -X POST https://<host>/api/sync/enekas \
  -H "Authorization: Bearer $CRON_SECRET"
```

## تلگرام
```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://<host>/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

دستورات: `/start` `/help` `/status` `/report` و سؤال آزاد (Q&A ساده)

## Cron (Vercel)
مسیر `/api/cron/daily` با هدر `Authorization: Bearer $CRON_SECRET` — sync سبک + تولید پیشنهادها.

## قانون طلایی
هیچ نوشتن روی انعکاس انجام نمی‌شود. کسری اعلامی با `internal_only` تا `matched_in_enekas` از دوبل‌شماری خارج می‌شود.
