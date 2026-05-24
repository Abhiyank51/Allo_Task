"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <Link 
          href="/" 
          onClick={() => {
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              window.dispatchEvent(new Event('reset-home-state'));
            }
          }}
          className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
        >
          <Activity className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-white">Allo<span className="text-teal-500">Health</span></span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                window.dispatchEvent(new Event('reset-home-state'));
              }
            }}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Products
          </Link>
          <Link href="/admin" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Inventory Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
