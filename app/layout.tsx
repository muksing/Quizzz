import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ARGame — สร้างเกม AR สำหรับห้องเรียน",
  description: "เว็บแอปให้ครูออกแบบเกม AR ให้นักเรียนเปิดกล้องเล่น",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
