# نرخ ارز | Currency Rates 💱

اپ قیمت لحظه‌ای **ارز، طلا و سکه و رمزارز** با دیزاین iOS و نرخ‌های بازار آزاد ایران — نسخه وب + اپ دسکتاپ ویندوز (Electron).

Live rates for currencies, gold/coins & crypto (Iranian free market) — web app + Windows desktop app.

## ✨ امکانات

- **۹۱ دارایی**: ۳۹ ارز جهانی، ۱۲ طلا/سکه، ۴۰ رمزارز
- **پروفایل واقعی**: پرچم SVG لوکال برای همه ارزها + آیکون رمزارزها (الان چند / نوبیتکس)
- **تبدیل ارز**: تبدیل بین هر دو دارایی (مثلاً دلار → یورو یا یورو → هریونیا) با نرخ مستقیم و معکوس
- **دوزبانه**: فارسی (RTL / تومان) و انگلیسی (LTR / دلار)
- **دیزاین iOS**: تم روشن/تیره، هدر بلور، bottom sheet، انیمیشن
- **نمودار قیمت**: ۷/۳۰/۹۰ روز و ۱ سال
- **علاقه‌مندی‌ها** و جستجو
- **ویجت شناور** (Document PiP)
- **آپدیت خودکار** در نسخه دسکتاپ (electron-updater + GitHub Releases)

## 📥 نصب (کاربران)

از صفحه [Releases](../../releases) آخرین نسخه `CurrencyRates-Setup-x.x.x.exe` رو دانلود و نصب کنید — مسیر نصب رو خودتون انتخاب می‌کنید.

> چون برنامه کد-ساین نشده، ویندوز SmartScreen هشدار می‌ده: **More info → Run anyway**

نسخه‌های بعدی خودکار از داخل برنامه آپدیت می‌شن — نیازی به دانلود مجدد نیست.

## 🚀 اجرای پروژه (توسعه‌دهنده)

```bash
bun install

# وب (dev)
bun run dev          # http://localhost:3000

# بیلد وب (production standalone)
bun run build

# ساخت نصاب ویندوز (Setup NSIS)
bun run electron:build   # خروجی: dist-out3/CurrencyRates-Setup-*.exe
```

## 🛠 تکنولوژی‌ها

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui · TanStack Query · Zustand · recharts · Electron 45 + electron-updater

## 📡 منابع داده

| منبع | استفاده |
|---|---|
| [alanchand.com](https://alanchand.com) | نرخ بازار آزاد ارز/طلا/سکه (scraping) |
| [Nobitex CDN](https://nobitex.ir) | آیکون رمزارزها |
| [open.er-api.com](https://open.er-api.com) | fallback ارزها (مثل هریونیا اوکراین) |
| CoinGecko / Frankfurter / gold-api | fallback رمزارز، نمودار تاریخی، فلزات |
| [flag-icons](https://github.com/lipis/flag-icons) | پرچم ارزها (MIT) |

پرچم‌ها و آیکون‌ها به‌صورت لوکال در `public/` باندل می‌شن — اپ دسکتاپ بدون اینترنت هم آیکون‌ها رو داره.

## 📁 ساختار

```
├── electron/            # main + preload (دسکتاپ)
├── scripts/             # stage-standalone، fix-appserver، تست‌ها
├── src/
│   ├── app/api/rates/   # API نرخ‌ها (alanchand + fallback)
│   ├── app/api/history/ # API نمودار تاریخی
│   ├── components/currency/  # UI (لیست، تبدیل، نمودار، بنر آپدیت...)
│   └── lib/             # assets.ts (۹۱ دارایی)، alanchand.ts (parser)، i18n، store
├── public/flags/        # ۳۹ پرچم SVG لوکال
├── public/crypto/       # ۴۰ آیکون رمزارز لوکال
├── electron-builder.yml # تنظیمات نصاب NSIS
└── BUILD-EXE.md         # راهنمای بیلد EXE
```

## 📄 لایسنس

MIT
