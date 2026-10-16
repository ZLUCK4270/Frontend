"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Icons } from "@/components/Icons";
import { useTheme } from "@/components/ThemeProvider";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col w-full bg-[var(--bg-main)] text-[var(--foreground)] antialiased">
      {/* Slide-over Customer Drawer & Quote Assistant */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Top Navigation Bar (Strict Top Bar Contract) ── */}
      <header className="sticky top-0 z-30 h-16 border-b border-[var(--border)] bg-[var(--bg-surface-glass)] backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between gap-8 transition-colors">
        {/* Zone 1: Single Brand Wordmark Element */}
        <Link
          href="/search"
          className="text-lg font-bold tracking-tight text-[var(--foreground-heading)] whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00d2ff] to-[#0077ff] flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Icons.Shirt className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold tracking-tight">
            Aimari <span className="text-[#00d2ff]">Sublitex</span>
          </span>
        </Link>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--foreground-muted)]">
          <Link
            href="/search"
            className={`hover:text-[var(--foreground-heading)] transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/search" ? "text-[#00d2ff] font-bold" : ""
            }`}
          >
            Buscar por Foto
          </Link>
          <Link
            href="/catalog"
            className={`hover:text-[var(--foreground-heading)] transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/catalog" ? "text-[#00d2ff] font-bold" : ""
            }`}
          >
            Catálogo Oficial
          </Link>
          <Link
            href="/eval"
            className={`hover:text-[var(--foreground-heading)] transition-colors whitespace-nowrap shrink-0 ${
              pathname === "/eval" ? "text-[#00d2ff] font-bold" : ""
            }`}
          >
            Ejemplos de Prueba
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="hover:text-[var(--foreground-heading)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cotizar Sublimación
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Theme Toggle + Drawer Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/search"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00d2ff] to-[#0084ff] rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Subir Camiseta
          </Link>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] active:scale-95 transition-all cursor-pointer"
            aria-label="Alternar tema"
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? (
              <Icons.Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Icons.Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            aria-label="Abrir panel de asesoría y cotizador"
            title="Asesoría y Cotizador"
          >
            <Icons.SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-medium hidden lg:inline">Asesor</span>
          </button>
        </div>
      </header>

      {/* ── Main Public Viewport Container ── */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* ── Clean Public Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-subtle)] py-8 px-4 sm:px-8 text-xs text-[var(--foreground-muted)]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--foreground-heading)]">Aimari Sublitex</span>
            <span aria-hidden="true">·</span>
            <span>Buscador Visual y Confección Deportiva</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/search" className="hover:text-[var(--foreground-heading)] transition-colors">
              Buscar Camiseta
            </Link>
            <Link href="/catalog" className="hover:text-[var(--foreground-heading)] transition-colors">
              Catálogo
            </Link>
            <Link href="/eval" className="hover:text-[var(--foreground-heading)] transition-colors">
              Ejemplos
            </Link>
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:text-[var(--foreground-heading)] transition-colors cursor-pointer"
            >
              Cotizaciones
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
