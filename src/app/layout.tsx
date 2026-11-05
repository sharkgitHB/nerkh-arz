import type { Metadata, Viewport } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نرخ ارز | Currency Rates",
  description: "اپ کامل نرخ روز ارز، طلا و رمزارزها با دیزاین حرفه‌ای iOS",
  keywords: ["نرخ ارز", "دلار", "طلا", "رمزارز", "currency", "exchange rate"],
  authors: [{ name: "Currency App" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${vazirmatn.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-vazir), var(--font-sans)" }}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
