import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/session-provider";
import { PhosphorProvider } from "@/providers/phosphor-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChronoTask",
  description: "Project management board — manage spaces, tasks, members, and track developer KPIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <SessionProvider>
          <PhosphorProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </PhosphorProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
