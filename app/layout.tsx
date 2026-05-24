import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Allo Health | Fulfillment",
  description: "Enterprise Medical Supply & Inventory Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50`} suppressHydrationWarning>
        <QueryProvider>
          <div className="relative flex min-h-screen flex-col">
            {/* Clinical Teal Background effects */}
            <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-neutral-950 to-neutral-950"></div>
            
            {/* Navbar */}
            <Navbar />

            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster theme="dark" position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
