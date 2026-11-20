import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const thai_font = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
});

export const metadata: Metadata = {
  title: "Target-R Heartbeat Monitor",
  description: "ระบบมอนิเตอร์เราเตอร์ 4G LTE ผ่าน TR-069",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${thai_font.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
