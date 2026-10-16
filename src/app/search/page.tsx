"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { CATALOG_JERSEYS, type CatalogJersey } from "@/lib/catalog";
import { identifyCountry } from "@/lib/countries";
import type { SearchResult, ApiResult } from "@/lib/types";
import { searchImage } from "@/lib/api";
import { Icons } from "@/components/Icons";
import { ResultCardSkeleton } from "@/components/Skeleton";

export default function SearchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Modals for public users
  const [selectedJerseyModal, setSelectedJerseyModal] = useState<CatalogJersey | null>(null);
  const [compareModal, setCompareModal] = useState<{ query: string; match: ApiResult } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image from File
  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Por favor sube un archivo de imagen válido (JPG, PNG o WEBP).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  // One-click sample jersey selector
  const handleSelectSample = useCallback(async (sample: CatalogJersey) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch sample as blob
      const res = await fetch(sample.image);
      const blob = await res.blob();
      const sampleFile = new File([blob], `${sample.id.toLowerCase()}.jpg`, { type: "image/jpeg" });

      setFile(sampleFile);
      setPreview(sample.image);

      const { data, error: err } = await searchImage("http://localhost:8000", sampleFile, "fusion");
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setResult(data);
      }
    } catch {
      setLoading(false);
      setError("No se pudo cargar el ejemplo seleccionado.");
    }
  }, []);

  // Trigger search on uploaded file
  const handleSearch = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await searchImage("http://localhost:8000", file, "fusion");
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
  }, [file]);

  // Handle Drag & Drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  // Support paste image from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const blob = items[i].getAsFile();
          if (blob) handleFile(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  const resultados = useMemo(() => result?.resultados ?? [], [result]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ── 1. Hero Section ── */}
      <section className="space-y-4 text-left">
        <div className="text-xs font-semibold tracking-wider text-[#00d2ff] uppercase">
          Reconocimiento Visual Sublitex
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground-heading)] max-w-3xl [text-wrap:balance]">
          Encuentra cualquier camiseta deportiva con una sola foto
        </h1>

        <p className="text-base sm:text-lg text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
          Sube una foto de una camiseta tomada con tu celular en una tienda, captura de pantalla o diseño mockup. Nuestro sistema identifica el modelo exacto y las mejores opciones en el catálogo para confección y sublimación.
        </p>
      </section>

      {/* ── 2. One-Click Sample Presets ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            ¿No tienes una foto a mano? Prueba con estos diseños:
          </span>
          <span className="text-xs text-[#00d2ff] hidden sm:inline">
            1 clic para probar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATALOG_JERSEYS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] hover:border-[#00d2ff]/40 hover:bg-white/[0.03] transition-all text-left group cursor-pointer active:scale-95 flex flex-col justify-between"
            >
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/30 mb-2 relative">
                <img
                  src={sample.image}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--foreground-heading)] truncate">
                  {sample.team}
                </div>
                <div className="text-[11px] text-[var(--foreground-muted)] truncate">
                  {sample.type} · {sample.season}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Image Upload & Query Zone ── */}
      <section className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!file ? (
          /* Empty Drag & Drop Zone */
          <div
            className={`dropzone-container p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[260px] ${
              dragging ? "is-active" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/25 flex items-center justify-center text-[#00d2ff] mb-4 shadow-lg shadow-cyan-500/10">
              <Icons.Upload className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-[var(--foreground-heading)] mb-1">
              Arrastra tu foto aquí o haz clic para seleccionarla
            </h2>

            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-md">
              Acepta JPG, PNG y WEBP. También puedes presionar <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Ctrl+V</kbd> para pegar una captura de pantalla directamente.
            </p>
          </div>
        ) : (
          /* Query Dashboard */
          <div className="p-5 sm:p-6 rounded-2xl border border-[#00d2ff]/30 bg-[var(--bg-surface)] backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Icons.Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                    Foto lista para analizar
                  </div>
                  <div className="text-sm font-bold text-[var(--foreground-heading)] truncate max-w-sm sm:max-w-md">
                    {file.name}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)] font-mono">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00d2ff] to-[#0084ff] text-slate-950 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Icons.RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reconociendo camiseta...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Search className="w-4 h-4" />
                      <span>Buscar en catálogo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-semibold border border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                  title="Cambiar foto"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* Photo Preview & Optimization Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex flex-col items-center">
                <span className="text-xs text-[var(--foreground-muted)] mb-2 font-medium self-start">
                  Tu foto cargada
                </span>
                {preview && (
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border border-[var(--border-subtle)]">
                    <img
                      src={preview}
                      alt="Foto cargada"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-[var(--foreground-muted)] mb-2 font-medium block">
                    Optimización Visual Automática
                  </span>
                  <div className="space-y-3 text-xs text-[var(--foreground-muted)] mt-3">
                    <div className="flex items-start gap-2.5">
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Aísla automáticamente la camiseta descartando fondos ruidosos.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Compara el patrón de franjas, escudo y colores con toda la biblioteca Sublitex.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Entrega ficha técnica lista para solicitar cotización de confección.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                  <span>Modo: Detección multiescala</span>
                  <span className="text-[#00d2ff] font-semibold">Listo para buscar</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Error Notification ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm flex items-center gap-3">
          <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-sm font-bold text-[#00d2ff] flex items-center gap-2">
              <Icons.RefreshCw className="w-4 h-4 animate-spin" />
              Comparando con el catálogo de camisetas...
            </span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Search Results Section ── */}
      {!loading && resultados.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground-heading)]">
                Camisetas coincidentes encontradas ({resultados.length})
              </h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                Ordenadas por similitud de diseño, colores y elementos característicos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {resultados.map((r, idx) => {
              const rank = idx + 1;
              const pct = Math.max(0, Math.min(100, (r.score_reranking ?? r.score) * 100));
              const country = identifyCountry(r.nombre, r.id);
              const matchedCatalogItem = CATALOG_JERSEYS.find(
                (j) => j.id === r.id || r.nombre.includes(j.team) || j.name.includes(r.nombre)
              );

              const whatsappText = encodeURIComponent(
                `Hola Sublitex, vi la camiseta ${r.nombre} (ID: ${r.id}) en su buscador con ${pct.toFixed(1)}% de coincidencia y deseo cotizarla para mi equipo.`
              );

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#00d2ff]/40 transition-all flex flex-col md:flex-row items-start gap-5 shadow-lg group"
                >
                  {/* Thumbnail with click zoom */}
                  <div
                    onClick={() => matchedCatalogItem && setSelectedJerseyModal(matchedCatalogItem)}
                    className="relative w-full md:w-48 aspect-[4/3] md:aspect-square rounded-xl overflow-hidden bg-black/30 border border-[var(--border)] flex-shrink-0 cursor-pointer group/img"
                  >
                    <img
                      src={r.imagen}
                      alt={r.nombre}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Icons.Maximize2 className="w-4 h-4" />
                      <span>Ver detalles</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-2">
                          <span className="font-bold text-[var(--foreground-heading)]">#{rank}</span>
                          <span aria-hidden="true">·</span>
                          <span>Código: {r.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[var(--foreground-heading)] mt-0.5">
                          {r.nombre}
                        </h3>
                      </div>

                      {/* Similarity Percentage */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-extrabold font-mono text-[#00d2ff] tabular-nums">
                          {pct.toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-[var(--foreground-muted)]">
                          {pct >= 90 ? "Coincidencia casi idéntica" : pct >= 80 ? "Alta similitud" : "Alternativa comercial"}
                        </div>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--foreground-muted)]">
                      {country && (
                        <span>{country.info.nombre_completo} ({country.info.seleccion})</span>
                      )}
                      {matchedCatalogItem && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{matchedCatalogItem.league}</span>
                          <span aria-hidden="true">·</span>
                          <span>Temporada {matchedCatalogItem.season}</span>
                        </>
                      )}
                    </div>

                    {/* Sublimation Specs if available */}
                    {matchedCatalogItem && (
                      <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] text-xs text-[var(--foreground-muted)] flex flex-wrap gap-x-4 gap-y-1">
                        <div>
                          <span className="text-[var(--foreground-subtle)]">Tela recomendada:</span>{" "}
                          <span className="font-semibold text-[var(--foreground-heading)]">
                            {matchedCatalogItem.sublimationSpecs.fabric}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-subtle)]">Impresión:</span>{" "}
                          <span className="font-semibold text-[var(--foreground-heading)]">
                            {matchedCatalogItem.sublimationSpecs.printType}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Public Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {preview && (
                          <button
                            onClick={() => setCompareModal({ query: preview, match: r })}
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--input-bg)] hover:border-[#00d2ff]/40 text-[var(--foreground)] flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Icons.Sliders className="w-3.5 h-3.5 text-[#00d2ff]" />
                            <span>Comparar con mi foto</span>
                          </button>
                        )}

                        {matchedCatalogItem && (
                          <button
                            onClick={() => setSelectedJerseyModal(matchedCatalogItem)}
                            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--input-bg)] hover:border-[#00d2ff]/40 text-[var(--foreground)] flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Icons.Info className="w-3.5 h-3.5" />
                            <span>Ver Ficha Técnica</span>
                          </button>
                        )}
                      </div>

                      {/* WhatsApp Quote Button */}
                      <a
                        href={`https://wa.me/?text=${whatsappText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Icons.MessageCircle className="w-4 h-4" />
                        <span>Cotizar confección</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 5. Side-by-Side Comparison Modal ── */}
      {compareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground-heading)]">
                  Comparador Visual: Tu Foto vs Catálogo
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {compareModal.match.nombre}
                </p>
              </div>
              <button
                onClick={() => setCompareModal(null)}
                className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                  Tu Foto de Consulta
                </span>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[var(--border)] flex items-center justify-center">
                  <img
                    src={compareModal.query}
                    alt="Tu foto"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-[#00d2ff]">
                  Resultado Encontrado ({((compareModal.match.score_reranking ?? compareModal.match.score) * 100).toFixed(1)}%)
                </span>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[#00d2ff]/30 flex items-center justify-center">
                  <img
                    src={compareModal.match.imagen}
                    alt="Resultado"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => setCompareModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--foreground-muted)] hover:text-white"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hola Sublitex, comparé mi foto con la camiseta ${compareModal.match.nombre} y deseo cotizarla.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md"
              >
                <Icons.MessageCircle className="w-4 h-4" />
                Cotizar este modelo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Jersey Details & Technical Modal ── */}
      {selectedJerseyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <span className="text-[11px] text-[#00d2ff] font-bold uppercase tracking-wider">
                  Ficha Técnica Sublitex
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground-heading)]">
                  {selectedJerseyModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJerseyModal(null)}
                className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[var(--border)]">
              <img
                src={selectedJerseyModal.image}
                alt={selectedJerseyModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              {selectedJerseyModal.description}
            </p>

            {/* Sublimation & Quality Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Tela</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJerseyModal.sublimationSpecs.fabric}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Tipo de Cuello</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJerseyModal.sublimationSpecs.collar}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Mangas & Acabados</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJerseyModal.sublimationSpecs.sleeve}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-subtle)] block text-[11px]">Técnica de Impresión</span>
                <span className="font-bold text-[var(--foreground-heading)]">
                  {selectedJerseyModal.sublimationSpecs.printType}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => setSelectedJerseyModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--foreground-muted)] hover:text-white"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hola Sublitex, vi la ficha técnica de la camiseta ${selectedJerseyModal.name} y me gustaría cotizar para mi equipo.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md"
              >
                <Icons.MessageCircle className="w-4 h-4" />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
