import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shivpratha Foundation - Wari Seva",
  description: "Donation for Varkari Seva - Pandharpur Wari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          <Header />
          <main className="flex-grow flex flex-col justify-center py-10 px-4">
            {children}
          </main>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
