# Fariman Ops — سامانه عملیات زنجیره گوشت فریمان

محصول عملیاتی جدا از نرم‌افزار مالی **انعکاس**. انعکاس فقط منبع دادهٔ read-only است.

## استک
- Next.js (App Router) روی Vercel
- PostgreSQL + Prisma
- ربات تلگرام (webhook)
- Connector انعکاس: session + `scenario/Sgrid`

## شروع محلی
```bash
cp .env.example .env
# DATABASE_URL و AUTH_SECRET و ENEKAS_* را پر کنید
npm install
npx prisma migrate deploy
npm run db:seed
npm run test
npm run dev
```

## مستندات
- `docs/domain-dictionary.md`
- `docs/enekas-mapping.md`
- `docs/product-catalog.md`
- `docs/api-map.md`
- `docs/runbook.md`

## قانون مهم
هیچ API یا کلاینتی روی انعکاس write نمی‌زند.
