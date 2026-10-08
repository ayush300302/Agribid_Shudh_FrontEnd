import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agribid Shudh Admin Console",
  description: "Administrative console for Agribid Shudh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
