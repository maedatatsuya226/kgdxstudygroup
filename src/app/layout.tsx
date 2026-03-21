import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "KGDXStudy Group",
  description: "KGDXStudy Group 動画研修プラットフォーム",
  manifest: "/manifest.json",
  icons: {
    icon: '/kgdx-logo.png',
    apple: '/kgdx-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KGDXStudy Group",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117", // Prime Video Deep Navy
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
