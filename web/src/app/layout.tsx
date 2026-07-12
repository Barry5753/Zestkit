import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Free Exact-Size Image Compressor | Zestkit",
    template: "%s",
  },
  description:
    "Compress JPG, PNG, and WebP images to strict file-size limits for free in your browser. No image upload, account, or payment required.",
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={inter.className}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
