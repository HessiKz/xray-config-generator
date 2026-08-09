import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سامانه عملیات فریمان",
  description: "لایه عملیاتی زنجیره گوشت فریمان — انعکاس فقط خواندنی",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-vazir)] antialiased">
        {children}
      </body>
    </html>
  );
}
