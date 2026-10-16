"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Icons } from "@/components/Icons";
import { useTheme } from "@/components/ThemeProvider";
import type { HealthInfo } from "@/lib/types";
import { healthCheck } from "@/lib/api";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const defaultApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    "http://localhost:8000";
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  // Initial health check
  useEffect(() => {
    let active = true;
    healthCheck(apiUrl).then(({ data }) => {
      if (active && data) setHealth(data);
    });
    return () => {
      active = false;
    };
  }, [apiUrl]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-[var(--bg-main)] text-[var(--foreground)] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        apiUrl={apiUrl}
        onApiUrlChange={setApiUrl}
        health={health}
        onHealthChange={setHealth}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area — dynamically offsets with sidebar */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-72" : "lg:pl-16"
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] bg-[var(--bg-surface-glass)] backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 active:scale-95 transition-all"
              aria-label="Abrir menú de navegación"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Platform Branding */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#0077ff] flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
                <Icons.Shirt className="w-4 h-4 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-[var(--foreground-heading)]">
                  Aimari <span className="text-[#00d2ff]">RAG Visual</span>
                </span>
                <span className="text-[10px] text-[var(--foreground-muted)] font-mono -mt-0.5">
                  Ficha 03-C · Sublitex
                </span>
              </div>
            </div>

            {/* Navigation Pills (Quick Tabs) */}
            <nav className="hidden md:flex items-center gap-1 ml-6 p-1 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
              <Link
                href="/search"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/search")
                    ? "bg-gradient-to-r from-[#00d2ff]/20 to-[#0084ff]/20 text-[#00d2ff] border border-[#00d2ff]/30 shadow-sm"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                }`}
              >
                <Icons.Search className="w-3.5 h-3.5" />
                Búsqueda
              </Link>
              <Link
                href="/eval"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/eval")
                    ? "bg-gradient-to-r from-[#00d2ff]/20 to-[#0084ff]/20 text-[#00d2ff] border border-[#00d2ff]/30 shadow-sm"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                }`}
              >
                <Icons.Flask className="w-3.5 h-3.5" />
                Evaluador
              </Link>
            </nav>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live API Health indicator */}
            <div
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                health
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  health
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                    : "bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]"
                }`}
              />
              <span className="font-mono">
                {health ? "API Conectada" : "API Offline"}
              </span>
            </div>

            {/* Quick Dark/Light Switch */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
              aria-label="Alternar tema"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <Icons.Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Icons.Moon className="w-4 h-4 text-sky-600" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
