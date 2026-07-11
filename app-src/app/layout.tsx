import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { getBackupHealth } from "@/lib/backup";
import { getUnresolvedFailedCount } from "@/lib/messaging/failedCount";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "e-Machines — Verkstads-CRM",
  description: "Kundregister, maskinägande och service för Stiga/Stihl",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const health = await getBackupHealth();
  const backupWarning = health.localWarning !== null || health.externalWarning !== null;
  const failedMessageCount = await getUnresolvedFailedCount();

  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppNav backupWarning={backupWarning} failedMessageCount={failedMessageCount} />
          <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
