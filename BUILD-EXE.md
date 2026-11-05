# ساخت نصاب ویندوز (Setup EXE)

## ساخت خروجی

```bash
bun install

# بیلد Next.js + پک win-unpacked + ترمیم node_modules + ساخت نصاب NSIS
bun run electron:build

# خروجی‌ها در dist-out3/:
#   CurrencyRates-Setup-1.0.0.exe   ← نصاب (موقع نصب می‌تونید مسیر رو انتخاب کنید)
#   win-unpacked/                   ← نسخه پرتابل بدون نصب (نرخ ارز.exe)
```

> ⚠️ نکته ویندوز: electron-builder پوشه `node_modules` رو توی extraResources کپی نمی‌کنه؛
> `scripts/fix-appserver.cjs` بعد از پک اون رو دستی جایگزین می‌کنه و بعد NSIS با
> `--prepackaged` ساخته می‌شه. اگه پوشه خروجی موقع بیلد قفل بود (آنتی‌ویروس)،
> یه اسم پوشه جدید بذارید (`-c.directories.output=dist-outX`).

## معماری

- `electron/main.cjs` — سرور Next.js standalone رو با Node داخلی الکترون اجرا می‌کنه (`ELECTRON_RUN_AS_NODE`) روی پورت 37777 و پنجره برنامه رو باز می‌کنه.
- `electron/preload.cjs` — پل امن `window.desktopApp`.
- `electron-builder.yml` — تنظیمات پکیج؛ سرور standalone از `.next/standalone-flat` به `resources/app-server` کپی می‌شه.
- `scripts/stage-standalone.cjs` — خروجی standalone تودرتوی Next 16 رو صاف می‌کنه و فایل‌های static/public رو اضافه می‌کنه.
- `build/icon.png` — آیکون برنامه (۵۱۲×۵۱۲، از favicon.svg).

## تنظیمات نصاب

فایل `electron-builder.yml` بخش `nsis`:
- `oneClick: false` + `allowToChangeInstallationDirectory: true` → کاربر مسیر نصب رو انتخاب می‌کنه.
- شورتکات دسکتاپ و استارت‌منو ساخته می‌شه.

## نکته شبکه (ایران)

دانلود باینری Electron و ابزارهای NSIS از github معمولاً در دسترس نیست؛ با mirror استفاده کنید:

```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
```
