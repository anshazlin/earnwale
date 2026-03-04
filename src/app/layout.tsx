import type { Metadata } from "next";
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

export const metadata = {
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
