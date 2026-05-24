import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Activity } from "lucide-react";

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
            <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                <a href="/" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors">
                  <Activity className="w-6 h-6" />
                  <span className="font-bold text-xl tracking-tight text-white">Allo<span className="text-teal-500">Health</span></span>
                </a>
                <nav className="flex items-center gap-6">
                  <a href="/" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                    Products
                  </a>
                  <Link href="/admin" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                    Inventory Dashboard
                  </Link>
                </nav>
              </div>
            </header>

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
