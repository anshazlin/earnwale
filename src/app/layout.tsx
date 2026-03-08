import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Earnwale",
  description: "Earn money by referring friends on Earnwale.",
  openGraph: {
    title: "Earnwale",
    description: "Join Earnwale and earn money by referring friends.",
    url: "https://earnwale.vercel.app",
    siteName: "Earnwale",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Earnwale",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased overflow-x-hidden bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
