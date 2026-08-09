# نقشه API

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/api/health` | public | سلامت سرویس |
| POST | `/api/auth/login` | public | ورود |
| POST | `/api/auth/logout` | session | خروج |
| GET | `/api/auth/me` | session | کاربر جاری |
| GET | `/api/dashboard` | session | آمار CEO |
| POST | `/api/sync/enekas` | ceo/admin یا CRON | همگام‌سازی خواندنی |
| GET | `/api/reports/warehouse-daily?day=` | session | گزارش روزانه انبار |
| GET | `/api/briefing?day=` | session | بریفینگ مدیرعامل |
| GET | `/api/catalog` | session | کاتالوگ و alias |
| GET | `/api/export/warehouse?day=` | session | فایل اکسل `.xlsx` انبار |
| GET | `/api/export/trade?day=` | session | فایل اکسل `.xlsx` خرید/فروش |
| GET | `/api/export/slaughterers` | session | فایل اکسل `.xlsx` کشتارکن |
| GET | `/api/export/briefing?day=` | session | فایل اکسل `.xlsx` بریفینگ |
| PUT | `/api/warehouse/counts` | warehouse/ceo/admin | ثبت مانده انبار |
| GET | `/api/trade/daily?day=` | session | خرید/فروش طرف‌حسابی |
| GET/POST/PATCH | `/api/coldroom` | session (+ceo match) | بچ/کسری/FEFO |
| GET/POST | `/api/coldroom/checks` | session | چکاپ سردخانه |
| GET/POST | `/api/energy` | session | قبوض انرژی |
| GET/POST | `/api/payroll` | session | پیش‌نویس حقوق |
| GET/POST | `/api/people/attendance` | session | حضور |
| GET/POST | `/api/payments` | session | تعهدات پرداخت |
| GET/POST | `/api/amendments` | session | اصلاحیه اسناد |
| GET/POST | `/api/suggestions` | session / ceo decide | پیشنهاد AI |
| POST | `/api/suggestions/generate` | ceo/admin | تولید پیشنهاد از قواعد |
| GET | `/api/audit` | admin/ceo | لاگ ممیزی |
| POST | `/api/cron/daily` | CRON_SECRET | جاب روزانه |
| POST | `/api/telegram/webhook` | secret token | ربات |
