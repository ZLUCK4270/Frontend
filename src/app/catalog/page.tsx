"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CATALOG_JERSEYS, type CatalogJersey } from "@/lib/catalog";
import { Icons } from "@/components/Icons";

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedJersey, setSelectedJersey] = useState<CatalogJersey | null>(null);

  const leagues = useMemo(() => {
    const list = Array.from(new Set(CATALOG_JERSEYS.map((j) => j.league)));
    return ["all", ...list];
  }, []);

  const filtered = useMemo(() => {
    return CATALOG_JERSEYS.filter((jersey) => {
      const matchesSearch =
        searchQuery === "" ||
        jersey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jersey.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jersey.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLeague =
        selectedLeague === "all" || jersey.league === selectedLeague;

      return matchesSearch && matchesLeague;
    });
  }, [searchQuery, selectedLeague]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ── Header Section ── */}
      <section className="space-y-3">
        <div className="text-xs font-semibold tracking-wider text-[#00d2ff] uppercase">
          Biblioteca de Diseños Deportivos
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground-heading)] [text-wrap:balance]">
          Catálogo Oficial de Camisetas Sublitex
        </h1>
        <p className="text-base text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
          Explora nuestra colección de camisetas de selecciones, grandes clubes y diseños personalizados para confección y sublimación de alto rendimiento.
        </p>
      </section>

      {/* ── Filters & Search Bar ── */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-md">
        {/* Text Search */}
        <div className="relative flex-1">
          <Icons.Search className="w-4 h-4 text-[var(--foreground-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por equipo, selección o país..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[#00d2ff]/50 transition-all"
          />
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLeague("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedLeague === "all"
                ? "bg-[#00d2ff] text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-white border border-[var(--border)]"
            }`}
          >
            Todas las ligas
          </button>
          {leagues
            .filter((l) => l !== "all")
            .map((league) => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedLeague === league
                    ? "bg-[#00d2ff] text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-white border border-[var(--border)]"
                }`}
              >
                {league}
              </button>
            ))}
        </div>
      </section>

      {/* ── Jersey Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((jersey) => {
          const whatsappQuote = encodeURIComponent(
            `Hola Sublitex, me interesa cotizar la camiseta ${jersey.name} (Código: ${jersey.id}) que vi en su catálogo.`
          );

          return (
            <div
              key={jersey.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#00d2ff]/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
            >
              <div>
                {/* Photo showcase */}
                <div
                  onClick={() => setSelectedJersey(jersey)}
                  className="w-full aspect-[4/3] bg-black/30 overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={jersey.image}
                    alt={jersey.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
                    {jersey.type}
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Icons.Maximize2 className="w-4 h-4" />
                    <span>Ver ficha técnica</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-2 mb-1">
                      <span>{jersey.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>{jersey.season}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground-heading)] leading-snug">
                      {jersey.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[var(--foreground-muted)] line-clamp-2 leading-relaxed">
                    {jersey.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[var(--foreground-muted)] mr-1">Colores:</span>
                    {jersey.colorHexes.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: hex }}
                        title={jersey.colors[i] || hex}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  href="/search"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] hover:border-[#00d2ff]/40 flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Icons.Search className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>Buscar similares</span>
                </Link>

                <a
                  href={`https://wa.me/?text=${whatsappQuote}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  title="Cotizar en WhatsApp"
                >
                  <Icons.MessageCircle className="w-4 h-4" />
                  <span>Cotizar</span>
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Modal for Jersey Details ── */}
      {selectedJersey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-[11px] text-[#00d2ff] font-bold uppercase tracking-wider">
                  Especificaciones Técnicas de Confección
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground-heading)]">
                  {selectedJersey.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJersey(null)}
                className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[var(--border)]">
              <img
                src={selectedJersey.image}
                alt={selectedJersey.name}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              {selectedJersey.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Tela</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJersey.sublimationSpecs.fabric}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Cuello</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJersey.sublimationSpecs.collar}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Mangas</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJersey.sublimationSpecs.sleeve}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Sublimación</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJersey.sublimationSpecs.printType}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => setSelectedJersey(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--foreground-muted)] hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hola Sublitex, vi la ficha técnica de ${selectedJersey.name} en su catálogo y quiero cotizar para mi equipo.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Icons.MessageCircle className="w-4 h-4" />
                Cotizar este modelo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
