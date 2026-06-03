import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/session-provider";
import { PhosphorProvider } from "@/providers/phosphor-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"]
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.papanclip.hompimpa.biz.id";

const siteTitle =
  "PapanClip – Project Management & Task Management Software for Agile Teams";
const siteDescription =
  "Manage projects, tasks, sprints, teams, and software development workflows in one platform. PapanClip helps teams plan, track, and deliver projects faster.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | PapanClip"
  },
  description: siteDescription,
  keywords: [
    "project management software",
    "task management software",
    "project management tool",
    "agile project management software",
    "software project management",
    "sprint planning software",
    "jira alternative",
    "project tracking software",
    "team collaboration software",
    "software development management",
    "project planning software",
    "work management software",
    "scrum board software",
    "kanban board software",
    "project management software indonesia",
    "task management software indonesia",
    "clickup alternative",
    "asana alternative",
    "trello alternative",
    "project management platform",
    "software manajemen proyek",
    "aplikasi manajemen proyek",
    "aplikasi manajemen tugas",
    "software manajemen tugas",
    "tools manajemen proyek",
    "aplikasi manajemen tim",
    "software manajemen proyek tim developer",
    "aplikasi pelacak tugas",
    "manajemen proyek agile",
    "perencanaan sprint",
    "kolaborasi tim",
    "alternatif jira",
    "alternatif clickup",
    "alternatif trello",
    "PapanClip"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: "PapanClip",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PapanClip — Project & Task Management Software"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  },
  verification: {
    google: "6dRmZQkL7tBQSoYX3eBQb_0eVNoGltIg98YHPE9Uy2A"
  }
};

export default function RootLayout({
  children
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
              <Analytics />
            </QueryProvider>
          </PhosphorProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
