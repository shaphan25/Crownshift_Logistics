import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthProvider } from '@/lib/context/AuthContext';
import RootLayoutClient from "@/components/root-layout-client";

export const metadata: Metadata = {
  title: "Crownshift Logistics LTD",
  description: "Reliable and efficient logistics solutions for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "!scroll-smooth")} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}