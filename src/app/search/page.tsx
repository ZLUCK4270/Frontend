"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { identifyCountry } from "@/lib/countries";
import type { SearchResult, ApiResult, HealthInfo } from "@/lib/types";
import { healthCheck, searchImage } from "@/lib/api";
import { Icons } from "@/components/Icons";
import { ResultCardSkeleton } from "@/components/Skeleton";

const CLASIFICACIONES = ["Acierto", "Sirve", "No sirve", "Muy similar", "Similar", "Poco similar", "No relacionado"];

function fmtNum(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString("es-PE");
}

function getScore(r: ApiResult): number {
  const s = r.score_reranking ?? r.score;
  return typeof s === "number" ? s : 0;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SearchPage() {
  const defaultApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    "http://localhost:8000";
  const [apiUrl] = useState(defaultApiUrl);
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<number, { clasificacion: string; observacion: string }>>({});
  const [savedEvalFeedback, setSavedEvalFeedback] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Health check on mount
  useEffect(() => {
    let active = true;
    healthCheck(apiUrl).then(({ data }) => {
      if (active && data) setHealth(data);
    });
    return () => {
      active = false;
    };
  }, [apiUrl]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Formato no válido. Sube un archivo de imagen (JPG, PNG o WEBP).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setEvaluations({});
  }, []);

  const handleSearch = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await searchImage(apiUrl, file, "fusion");
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setResult(data);
    }
  }, [file, apiUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const resultados = useMemo(() => result?.resultados ?? [], [result]);

  const handleSaveEvaluation = (r: ApiResult, idx: number, rank: number, score: number) => {
    const ev = evaluations[idx] || { clasificacion: "Acierto", observacion: "" };
    const row = `${result?.query_id ?? file?.name ?? "consulta"},${r.id},${rank},${score.toFixed(4)},${ev.clasificacion},"${ev.observacion.replace(/"/g, '""')}"`;
    const header = "consulta,resultado_id,posicion,score,clasificacion_humana,observacion";
    const existing = localStorage.getItem("eval_rows");
    const rows = existing ? (JSON.parse(existing) as string[]) : [];
    rows.push(row);
    localStorage.setItem("eval_rows", JSON.stringify(rows));
    const csv = [header, ...rows].join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), "evaluation.csv");

    setSavedEvalFeedback(idx);
    setTimeout(() => setSavedEvalFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Hero Section ── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="eyebrow-pill">
            <span className="eyebrow-dot-pulse" />
            <span>Motor RAG Visual Multimodal</span>
          </div>

          {health && (
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--foreground-muted)] bg-[var(--input-bg)] border border-[var(--border)] px-3 py-1 rounded-full">
              <span>{fmtNum(health.products)} camisetas</span>
              <span>·</span>
              <span>{fmtNum(health.embeddings)} vectores</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">Activo</span>
            </div>
          )}
        </div>

        <h1 className="hero-headline hero-headline-gradient max-w-3xl">
          Encuentra camisetas deportivas por similitud visual
        </h1>
        <p className="text-base sm:text-lg text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
          Sube una foto de una camiseta —incluso con recortes, celular o mockup— y nuestro motor híbrido
          (Fashion-CLIP + YOLO + Reranking) identificará los diseños más parecidos en el catálogo.
        </p>
      </section>

      {/* ── Image Upload & Query Hub ── */}
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
            ref={dragRef}
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
            <div className="w-16 h-16 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/25 flex items-center justify-center text-[#00d2ff] mb-4 shadow-lg shadow-cyan-500/10 transition-transform group-hover:scale-105">
              <Icons.Upload className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground-heading)] mb-1">
              Arrastra y suelta tu foto aquí, o haz clic para explorar
            </h3>
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-md">
              Acepta JPG, PNG y WEBP. Diseñado para fotos reales tomadas con celular en tiendas o mockups.
            </p>
          </div>
        ) : (
          /* Query Preview Dashboard */
          <div className="glass-panel p-5 sm:p-6 border border-[#00d2ff]/30 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Icons.Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                    Imagen de consulta cargada
                  </div>
                  <div className="text-sm font-bold text-[var(--foreground-heading)] truncate max-w-sm sm:max-w-md">
                    {file.name}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)] font-mono">
                    {(file.size / 1024).toFixed(1)} KB · {file.type || "image"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn-primary-action flex-1 sm:flex-none px-6 py-3 text-sm rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analizando vectorialmente...</span>
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
                    setEvaluations({});
                  }}
                  className="btn-secondary-action px-4 py-3 text-sm rounded-xl"
                  title="Cambiar imagen"
                >
                  <Icons.Refresh className="w-4 h-4" />
                  <span className="hidden sm:inline">Cambiar</span>
                </button>
              </div>
            </div>

            {/* Side by side Preview: Original vs Preprocessed by API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-2 font-medium">
                  <span>📸 Consulta Original</span>
                  <span className="text-[10px] font-mono">Entrada de usuario</span>
                </div>
                {preview && (
                  <div className="w-full h-56 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border border-[var(--border-subtle)]">
                    <img
                      src={preview}
                      alt="Consulta original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Preprocessed by API */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-2 font-medium">
                  <span className="flex items-center gap-1.5 text-[#00d2ff] font-bold">
                    <Icons.Sparkles className="w-3.5 h-3.5" />
                    Segmentada por API (Hito 2/3)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Torso YOLO</span>
                </div>
                {result?.imagen_procesada_b64 ? (
                  <div className="w-full h-56 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center border border-[var(--border-subtle)]">
                    <img
                      src={`data:image/jpeg;base64,${result.imagen_procesada_b64}`}
                      alt="Segmentada por API"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 rounded-lg border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-center p-4 text-[var(--foreground-muted)] text-xs">
                    <Icons.Cpu className="w-8 h-8 opacity-40 mb-2" />
                    <span>La versión segmentada se generará automáticamente al ejecutar la búsqueda</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preprocessing Inspector Details */}
            {result?.preprocesamiento?.ok && (
              <div className="p-3.5 rounded-xl border border-[#00d2ff]/20 bg-[#00d2ff]/5 text-xs flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--foreground-muted)]">
                <div>
                  <span className="text-[var(--foreground-subtle)]">Backend:</span>{" "}
                  <code className="text-[#00d2ff] font-mono font-bold">{result.preprocesamiento.backend}</code>
                </div>
                <div>
                  <span className="text-[var(--foreground-subtle)]">Tiempo segmentación:</span>{" "}
                  <span className="text-[var(--foreground)] font-bold">{result.preprocesamiento.tiempo_segundos} s</span>
                </div>
                {result.preprocesamiento.recorte_pct != null && (
                  <div>
                    <span className="text-[var(--foreground-subtle)]">Recorte torso:</span>{" "}
                    <span className="text-[var(--foreground)] font-bold">{result.preprocesamiento.recorte_pct}%</span>
                  </div>
                )}
                {result.preprocesamiento.pasos && (
                  <div>
                    <span className="text-[var(--foreground-subtle)]">Pasos:</span>{" "}
                    <span className="text-[var(--foreground)]">{result.preprocesamiento.pasos.join(" → ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm flex items-start gap-3 animate-fade-in">
          <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Error en la consulta</div>
            <p className="text-xs leading-relaxed opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* ── Loading Skeletons ── */}
      {loading && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#00d2ff]">
              <Icons.Sparkles className="w-4 h-4 animate-spin" />
              <span>Extrayendo características visuales...</span>
            </div>
            <span className="text-xs text-[var(--foreground-muted)] font-mono">Procesando Top 5</span>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Search Results Section ── */}
      {!loading && resultados.length > 0 && (
        <section className="space-y-5 animate-fade-in">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Icons.Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--foreground-heading)]">
                  Top {resultados.length} Camisetas Más Similares
                </h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Ordenado por similitud vectorial Fashion-CLIP con Reranking de estructura y color
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--foreground-muted)] bg-[var(--input-bg)] border border-[var(--border)] px-3 py-1.5 rounded-xl">
              <span>{result?.modelo ?? "Fusión 3-Modelos"}</span>
              <span>·</span>
              <span>{result?.tiempo_segundos ?? "0.35"} s</span>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {resultados.map((r, idx) => {
              const rank = idx + 1;
              const score = getScore(r);
              const pct = Math.max(0, Math.min(100, score * 100));
              const country = identifyCountry(r.nombre, r.id);
              const isFirst = rank === 1;

              return (
                <div
                  key={r.id}
                  className="result-card p-4 sm:p-5"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Jersey Thumbnail */}
                    <div className="relative w-full sm:w-40 h-52 sm:h-40 rounded-2xl overflow-hidden bg-black/30 border border-[var(--border)] flex-shrink-0 group">
                      <img
                        src={`/api/images/${r.imagen}`}
                        alt={r.nombre}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (r.url) (e.target as HTMLImageElement).src = r.url;
                        }}
                      />
                      <div className="absolute top-2 left-2 sm:hidden">
                        <span className={`rank-badge-pill ${isFirst ? "rank-badge-first" : "rank-badge-subsequent"}`}>
                          #{rank}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Scores */}
                    <div className="flex-1 min-w-0 w-full space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className={`hidden sm:flex rank-badge-pill ${isFirst ? "rank-badge-first" : "rank-badge-subsequent"}`}>
                            #{rank}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground-heading)] leading-snug truncate">
                              {r.nombre}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--foreground-muted)] font-mono">
                              <span className="font-bold text-[var(--foreground)]">{r.id}</span>
                              {r.proveedor && (
                                <>
                                  <span>·</span>
                                  <span>Proveedor: {r.proveedor}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Similarity Score Tag */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-extrabold font-mono text-[#00d2ff]">
                            {pct.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-[var(--foreground-subtle)] font-mono">
                            score: {score.toFixed(4)}
                          </div>
                        </div>
                      </div>

                      {/* Football Country Identification Badge */}
                      {country && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                          <span>🌍 {country.info.nombre_completo}</span>
                          <span>·</span>
                          <span className="text-[var(--foreground)]">{country.info.seleccion}</span>
                          {country.info.patron_tipico && (
                            <span className="text-[10px] text-[var(--foreground-muted)] font-normal hidden md:inline">
                              ({country.info.patron_tipico})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Score Bar Meter */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[var(--foreground-muted)]">
                          <span>Nivel de coincidencia</span>
                          <span className="font-mono">{pct >= 85 ? "Muy alta" : pct >= 70 ? "Alta" : "Moderada"}</span>
                        </div>
                        <div className="score-track">
                          <div
                            className={`score-fill ${isFirst ? "score-fill-gold" : ""}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {r.url && (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary-action px-3 py-1.5 rounded-lg text-xs"
                            >
                              <Icons.ExternalLink className="w-3.5 h-3.5" />
                              <span>Catálogo</span>
                            </a>
                          )}
                          <a
                            href={`/api/images/${r.imagen}`}
                            download
                            className="btn-secondary-action px-3 py-1.5 rounded-lg text-xs"
                          >
                            <Icons.Download className="w-3.5 h-3.5" />
                            <span>Descargar</span>
                          </a>
                          <button
                            onClick={() => window.print()}
                            className="btn-secondary-action px-3 py-1.5 rounded-lg text-xs"
                          >
                            <Icons.Printer className="w-3.5 h-3.5" />
                            <span>Imprimir</span>
                          </button>
                        </div>

                        {/* Quick Evaluation Drawer */}
                        <details className="group/eval text-xs">
                          <summary className="cursor-pointer text-[var(--foreground-muted)] hover:text-[#00d2ff] font-bold list-none flex items-center gap-1 transition-colors">
                            <Icons.Edit className="w-3.5 h-3.5" />
                            <span>Calificar resultado #{rank}</span>
                          </summary>
                          <div className="mt-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] space-y-3 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] mb-1">
                                  Juicio
                                </label>
                                <select
                                  value={evaluations[idx]?.clasificacion ?? "Acierto"}
                                  onChange={(e) =>
                                    setEvaluations((prev) => ({
                                      ...prev,
                                      [idx]: {
                                        clasificacion: e.target.value,
                                        observacion: prev[idx]?.observacion ?? "",
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border)] text-[var(--foreground)] text-xs"
                                >
                                  {CLASIFICACIONES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] mb-1">
                                  Observación (opcional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Nota sobre el diseño..."
                                  value={evaluations[idx]?.observacion ?? ""}
                                  onChange={(e) =>
                                    setEvaluations((prev) => ({
                                      ...prev,
                                      [idx]: {
                                        clasificacion: prev[idx]?.clasificacion ?? "Acierto",
                                        observacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border)] text-[var(--foreground)] text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1">
                              <button
                                onClick={() => handleSaveEvaluation(r, idx, rank, score)}
                                className="btn-primary-action px-3 py-1.5 text-xs rounded-lg"
                              >
                                <Icons.Check className="w-3.5 h-3.5" />
                                Guardar evaluación
                              </button>
                              {savedEvalFeedback === idx && (
                                <span className="text-emerald-400 font-bold text-xs animate-fade-in">
                                  ✓ Guardado en evaluation.csv
                                </span>
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty State After Search ── */}
      {!loading && result && resultados.length === 0 && (
        <div className="text-center py-16 glass-panel space-y-3">
          <Icons.Search className="w-12 h-12 mx-auto text-[var(--foreground-muted)] opacity-50" />
          <h3 className="text-lg font-bold text-[var(--foreground)]">No se encontraron diseños similares</h3>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
            Prueba a cargar una foto más nítida de la camiseta o asegúrate de que el backend FastAPI esté conectado.
          </p>
        </div>
      )}

      {/* ── Workflow Guide ── */}
      {!file && (
        <section className="glass-panel p-6 border-dashed border-[var(--border)] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-2">
            <Icons.Layers className="w-4 h-4 text-[#00d2ff]" />
            <span>Flujo de Trabajo del Buscador</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1">
              <div className="font-extrabold text-[#00d2ff] font-mono">01. Subida Externa</div>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                Fotos tomadas en tiendas, redes sociales o mockups. No uses fotos del propio catálogo.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1">
              <div className="font-extrabold text-[#00d2ff] font-mono">02. Limpieza de Consulta</div>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                El pipeline segmenta la prenda para remover personas, fondos ruidosos o marcos.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1">
              <div className="font-extrabold text-[#00d2ff] font-mono">03. Reranking Top 5</div>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                Reordena por coherencia de color y patrón para maximizar la utilidad comercial de la prenda.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
