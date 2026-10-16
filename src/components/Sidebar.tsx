"use client";

import Link from "next/link";
import { Icons } from "./Icons";
import { CATALOG_JERSEYS } from "@/lib/catalog";
import { useState } from "react";

interface SidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
  onSelectSample?: (sampleId: string) => void;
}

export default function Sidebar({
  sidebarOpen,
  onClose,
  onSelectSample,
}: SidebarProps) {
  const [quantity, setQuantity] = useState(12);

  const whatsappMessage = encodeURIComponent(
    `¡Hola Sublitex! Estoy interesado en cotizar ${quantity} camisetas deportivas personalizadas que encontré en su buscador visual.`
  );

  return (
    <>
      {/* Mobile & Desktop Overlay when Drawer is open */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Public Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm sm:max-w-md bg-[var(--bg-subtle)] border-l border-[var(--border)] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
              <Icons.Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground-heading)]">
                Guía y Asesoría Sublitex
              </h2>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                Buscador y confección de camisetas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
            aria-label="Cerrar panel"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Steps for Customer */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d2ff] flex items-center gap-1.5">
              <Icons.HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo funciona el buscador?</span>
            </h3>
            <div className="space-y-2 text-xs text-[var(--foreground-muted)]">
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-semibold text-[var(--foreground-heading)]">
                    Sube una foto
                  </div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">
                    Toma una foto con tu celular en tienda, televisión, redes o sube un diseño.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-semibold text-[var(--foreground-heading)]">
                    Reconocimiento inteligente
                  </div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">
                    Identificamos el club, selección, temporada y colores dominantes al instante.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-semibold text-[var(--foreground-heading)]">
                    Cotiza tu confección
                  </div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">
                    Solicita réplica exacta o personalización con el nombre de tu equipo por WhatsApp.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Instant Sample Inspiration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-heading)] flex items-center gap-1.5">
                <Icons.Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Camisetas Populares</span>
              </h3>
              <Link
                href="/catalog"
                onClick={onClose}
                className="text-[11px] text-[#00d2ff] hover:underline font-medium"
              >
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {CATALOG_JERSEYS.slice(0, 4).map((jersey) => (
                <div
                  key={jersey.id}
                  onClick={() => {
                    if (onSelectSample && jersey.sampleQueryId) {
                      onSelectSample(jersey.sampleQueryId);
                    }
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] hover:border-[#00d2ff]/40 transition-all cursor-pointer group"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-black/30 mb-2">
                    <img
                      src={jersey.image}
                      alt={jersey.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-[var(--foreground-heading)] truncate">
                    {jersey.team}
                  </div>
                  <div className="text-[10px] text-[var(--foreground-muted)] truncate">
                    {jersey.type} · {jersey.season}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Sublimation Quote Calculator */}
          <section className="p-4 rounded-2xl border border-[#00d2ff]/30 bg-gradient-to-br from-[#00d2ff]/10 via-[#0066ff]/5 to-transparent space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00d2ff]">
              <Icons.ShieldCheck className="w-4 h-4" />
              <span>Cotizador Rápido para Equipos</span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-[var(--foreground-muted)]">Cantidad estimada:</span>
                <span className="font-bold font-mono text-[var(--foreground-heading)] text-sm">
                  {quantity} unidades
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#00d2ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--foreground-muted)] mt-1">
                <span>5 (Mínimo)</span>
                <span>30 (Equipo completo)</span>
                <span>60+ (Club/Liga)</span>
              </div>
            </div>

            <div className="text-[11px] text-[var(--foreground-muted)] space-y-1">
              <div>✓ Tela Win Dry-Fit transpirable con filtro UV</div>
              <div>✓ Sublimación digital full color sin costo extra de logos</div>
              <div>✓ Nombres y números personalizados incluidos</div>
            </div>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Icons.MessageCircle className="w-4 h-4" />
              <span>Cotizar {quantity} camisetas por WhatsApp</span>
            </a>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center text-[11px] text-[var(--foreground-muted)]">
          Aimari Sublitex · Confección y Sublimación Deportiva
        </div>
      </aside>
    </>
  );
}
