"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icons } from "@/components/Icons";
import { ResultCardSkeleton } from "@/components/Skeleton";

type EvalCase = {
  id_caso: string;
  descripcion: string;
  id_correcto: string;
  tipo?: string;
};

type ApiResult = {
  id: string;
  nombre: string;
  imagen: string;
  url: string;
  score: number;
  score_reranking?: number;
};

type Rating = "Acierto" | "Sirve" | "No sirve";

type RatedResult = {
  id: string;
  nombre: string;
  imagen: string;
  position: number;
  score: number;
  rating: Rating;
};

type CaseEval = {
  id_caso: string;
  id_correcto: string;
  descripcion: string;
  tipo?: string;
  rated: RatedResult[];
  completed_at: string;
};

type Session = {
  cases: EvalCase[];
  evals: CaseEval[];
  current_idx: number;
};

const LS_KEY = "evaluador_v2_session";

function calcMetrics(evals: CaseEval[]) {
  const n = evals.length;
  if (!n) return { p1: 0, r5: 0, util: 0 };

  let p1 = 0;
  let r5 = 0;
  let utilSum = 0;
  let utilN = 0;

  for (const ev of evals) {
    const top1 = ev.rated.find((r) => r.position === 1);
    if (top1?.rating === "Acierto") p1++;

    const found = ev.rated.find(
      (r) => r.id === ev.id_correcto && r.rating === "Acierto"
    );
    if (found) r5++;

    const others = ev.rated.filter((r) => r.rating !== "Acierto");
    if (others.length) {
      utilSum +=
        others.filter((r) => r.rating === "Sirve").length / others.length;
      utilN++;
    }
  }

  return {
    p1: Math.round((p1 / n) * 100),
    r5: Math.round((r5 / n) * 100),
    util: utilN ? Math.round((utilSum / utilN) * 100) : 100,
  };
}

function exportCSV(evals: CaseEval[]) {
  const rows = [
    "caso,tipo,descripcion,id_correcto,posicion,id_resultado,nombre,score,juicio",
  ];
  for (const ev of evals) {
    for (const r of ev.rated) {
      rows.push(
        [
          ev.id_caso,
          ev.tipo ?? "",
          `"${ev.descripcion}"`,
          ev.id_correcto,
          r.position,
          r.id,
          `"${r.nombre}"`,
          r.score.toFixed(4),
          r.rating,
        ].join(",")
      );
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluacion_sublitex_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CriteriaLegend() {
  return (
    <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 text-xs space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-extrabold uppercase tracking-wider text-[11px]">
        <Icons.Keyboard className="w-4 h-4" />
        <span>Criterios de Juicio Fijos (Ficha 03-C)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-emerald-500/20">
          <div className="text-emerald-400 font-extrabold mb-1 flex items-center gap-1.5">
            <span className="keycap bg-emerald-500/20 text-emerald-300">1</span>
            Acierto
          </div>
          <p className="text-[var(--foreground-muted)] text-[11px] leading-relaxed">
            Mismo diseño, aunque varíe el color, año, escudo o sponsor.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-amber-500/20">
          <div className="text-amber-400 font-extrabold mb-1 flex items-center gap-1.5">
            <span className="keycap bg-amber-500/20 text-amber-300">2</span>
            Sirve
          </div>
          <p className="text-[var(--foreground-muted)] text-[11px] leading-relaxed">
            No es el mismo, pero el cliente lo aceptaría como alternativa comercial.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-rose-500/20">
          <div className="text-rose-400 font-extrabold mb-1 flex items-center gap-1.5">
            <span className="keycap bg-rose-500/20 text-rose-300">3</span>
            No sirve
          </div>
          <p className="text-[var(--foreground-muted)] text-[11px] leading-relaxed">
            Diseño completamente diferente y no relacionado.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  colorScheme,
}: {
  label: string;
  value: number;
  description: string;
  colorScheme: "cyan" | "emerald" | "purple";
}) {
  const schemes = {
    cyan: "border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-blue-500/5 to-transparent text-cyan-400",
    emerald: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent text-emerald-400",
    purple: "border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-indigo-500/5 to-transparent text-purple-400",
  };

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md space-y-2 shadow-lg ${schemes[colorScheme]}`}>
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--foreground-muted)]">
        {label}
      </span>
      <div className="text-5xl font-black font-mono tracking-tight text-[var(--foreground-heading)]">
        {value}%
      </div>
      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed pt-1">
        {description}
      </p>
    </div>
  );
}

function InterpretRow({ label, value }: { label: string; value: number }) {
  const s =
    value >= 70
      ? { icon: "✅", text: "Listo para indexación de biblioteca Sublitex", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" }
      : value >= 50
      ? { icon: "⚠️", text: "Aceptable — margen de mejora en reranking", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" }
      : { icon: "❌", text: "Necesita calibración antes de producción", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-sm">{s.icon}</span>
        <span className="font-bold text-[var(--foreground-heading)]">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black font-mono text-[var(--foreground-heading)]">{value}%</span>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.color}`}>
          {s.text}
        </span>
      </div>
    </div>
  );
}

export default function Evaluador() {
  const [phase, setPhase] = useState<"setup" | "evaluating" | "done">("setup");
  const [session, setSession] = useState<Session | null>(null);
  const [queryFile, setQueryFile] = useState<File | null>(null);
  const [queryPreview, setQueryPreview] = useState<string | null>(null);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const queryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const s: Session = JSON.parse(saved);
        setSession(s);
        if (s.current_idx >= s.cases.length && s.evals.length > 0) {
          setPhase("done");
        } else if (s.cases.length > 0) {
          setPhase("evaluating");
        }
      }
    } catch {}
  }, [mounted]);

  const persist = useCallback((s: Session) => {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleJsonLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const cases: EvalCase[] = raw.cases ?? raw;
        if (
          !Array.isArray(cases) ||
          !cases.length ||
          !cases[0]?.id_correcto
        ) {
          setError(
            'El JSON debe tener: { "cases": [{ "id_caso", "descripcion", "id_correcto", "tipo" }] }'
          );
          return;
        }
        const s: Session = { cases, evals: [], current_idx: 0 };
        persist(s);
        setPhase("evaluating");
        showToast(`✓ ${cases.length} casos cargados`);
      } catch {
        setError("No se pudo leer el JSON. Verifica que el archivo tenga formato válido.");
      }
    };
    reader.readAsText(f);
  };

  const resetSession = () => {
    if (confirm("¿Estás seguro de reiniciar la sesión de evaluación? Se perderá el avance actual no exportado.")) {
      localStorage.removeItem(LS_KEY);
      setSession(null);
      setPhase("setup");
      setQueryFile(null);
      setQueryPreview(null);
      setApiResults([]);
      setRatings({});
      setError(null);
    }
  };

  const currentCase = session?.cases[session.current_idx] ?? null;

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan archivos de imagen (JPG, PNG).");
      return;
    }
    setQueryFile(file);
    setQueryPreview(URL.createObjectURL(file));
    setApiResults([]);
    setRatings({});
    setError(null);
  };

  const handleSearch = async () => {
    if (!queryFile) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", queryFile);
    fd.append("modo", "auto");
    const targetApi =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.VITE_API_URL ||
      "http://localhost:8000";
    try {
      const res = await fetch(`${targetApi.replace(/\/+$/, "")}/search/image`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`API respondió con estado HTTP ${res.status}`);
      const data = await res.json();
      const docs: ApiResult[] = data.resultados ?? data;
      setApiResults(docs.slice(0, 5));
      showToast("✓ 5 resultados recibidos del buscador");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red";
      setError(`No se pudo conectar con la API: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (id: string, rating: Rating) => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  };

  const allRated =
    apiResults.length > 0 && apiResults.every((r) => !!ratings[r.id]);

  const handleNextCase = useCallback(() => {
    if (!session || !currentCase || !allRated) return;

    const rated: RatedResult[] = apiResults.map((r, i) => ({
      id: r.id,
      nombre: r.nombre,
      imagen: r.imagen,
      position: i + 1,
      score: r.score_reranking ?? r.score ?? 0,
      rating: ratings[r.id] as Rating,
    }));

    const newEval: CaseEval = {
      id_caso: currentCase.id_caso,
      id_correcto: currentCase.id_correcto,
      descripcion: currentCase.descripcion,
      tipo: currentCase.tipo,
      rated,
      completed_at: new Date().toISOString(),
    };

    const newSession: Session = {
      ...session,
      evals: [...session.evals, newEval],
      current_idx: session.current_idx + 1,
    };

    persist(newSession);
    setQueryFile(null);
    setQueryPreview(null);
    setApiResults([]);
    setRatings({});

    if (newSession.current_idx >= newSession.cases.length) {
      setPhase("done");
      showToast("¡Evaluación completada! 🎉");
    } else {
      showToast(
        `Caso guardado. Siguiente: ${newSession.cases[newSession.current_idx].id_caso}`
      );
    }
  }, [session, currentCase, allRated, apiResults, ratings, persist]);

  // Keyboard shortcut listener (Ficha 03-C / DECISIONES.md: D1)
  useEffect(() => {
    if (phase !== "evaluating" || apiResults.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Enter to advance when all rated
      if (e.key === "Enter" && allRated) {
        e.preventDefault();
        handleNextCase();
        return;
      }

      // Numbers 1, 2, 3 to rate the next unrated result!
      if (["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        const unratedResult = apiResults.find((r) => !ratings[r.id]);
        if (unratedResult) {
          const map: Record<string, Rating> = {
            "1": "Acierto",
            "2": "Sirve",
            "3": "No sirve",
          };
          handleRate(unratedResult.id, map[e.key]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, apiResults, ratings, allRated, handleNextCase]);

  const metrics = session ? calcMetrics(session.evals) : { p1: 0, r5: 0, util: 0 };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-[var(--foreground)] text-[var(--background)] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 transition-all duration-300 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Icons.Check className="w-4 h-4 text-emerald-500" />
        <span className="text-xs sm:text-sm font-bold">{toast}</span>
      </div>

      {/* ── Subheader & Navigation Info ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="eyebrow-pill">
              <span className="eyebrow-dot-pulse" />
              Ficha 03-C · Sublitex
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground-heading)]">
            Evaluador Experto del Buscador
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
            Medición de calidad real con juicios humanos independientes y almacenamiento local persistente
          </p>
        </div>

        {phase !== "setup" && session && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#00d2ff]">
                Caso {Math.min(session.current_idx + 1, session.cases.length)} de {session.cases.length}
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">
                {session.evals.length} completados
              </div>
            </div>

            <button
              onClick={resetSession}
              className="btn-secondary-action px-3 py-1.5 rounded-lg text-xs"
              title="Reiniciar sesión y cargar nuevo archivo"
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
         PHASE 1: SETUP (Cargar casos.json)
         ══════════════════════════════════════════════════════════════ */}
      {phase === "setup" && (
        <section className="max-w-2xl mx-auto space-y-6 text-center py-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground-heading)]">
              Cargar Lote de Casos de Prueba
            </h2>
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
              Sube el archivo <code className="text-[#00d2ff] bg-[var(--input-bg)] px-2 py-0.5 rounded font-mono">casos.json</code>.
              Todo el avance se guarda automáticamente en <code>localStorage</code>; si el navegador se cierra por error, no perderás nada.
            </p>
          </div>

          <label className="dropzone-container p-10 sm:p-14 flex flex-col items-center justify-center cursor-pointer block">
            <div className="w-16 h-16 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] mb-4">
              <Icons.Upload className="w-8 h-8" />
            </div>
            <span className="text-base font-bold text-[var(--foreground)] mb-1">
              Haz clic para cargar casos.json
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              Estructura esperada: <code>&#123; cases: [&#123; id_caso, descripcion, id_correcto, tipo &#125;] &#125;</code>
            </span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleJsonLoad}
            />
          </label>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left">
              {error}
            </div>
          )}

          <div className="text-left">
            <CriteriaLegend />
          </div>

          <div className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
            <div className="text-[var(--foreground-muted)] mb-2">// Formato estándar casos.json</div>
            <pre className="text-[11px] leading-tight">
{`{
  "cases": [
    {
      "id_caso": "caso_001",
      "descripcion": "Foto real en tienda con fondo de perchero",
      "id_correcto": "AIM-P001-001",
      "tipo": "foto_real"
    }
  ]
}`}
            </pre>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
         PHASE 2: EVALUATING (Un caso a la vez + atajos de teclado)
         ══════════════════════════════════════════════════════════════ */}
      {phase === "evaluating" && currentCase && session && (
        <section className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-[var(--foreground-muted)]">
              <span>Progreso de evaluación</span>
              <span>
                {Math.round((session.current_idx / session.cases.length) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00d2ff] to-[#0084ff] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(session.current_idx / session.cases.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Case Header Card */}
          <div className="glass-panel p-5 sm:p-6 border-[#00d2ff]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00d2ff]/15 text-[#00d2ff] border border-[#00d2ff]/30">
                  {currentCase.tipo ?? "Caso de prueba"}
                </span>
                <span className="text-xs font-mono text-[var(--foreground-muted)]">
                  {currentCase.id_caso}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground-heading)]">
                {currentCase.descripcion}
              </h2>
              <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5 pt-1">
                <span>ID canónico esperado:</span>
                <strong className="text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {currentCase.id_correcto}
                </strong>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black font-mono text-[var(--foreground-subtle)]">
                #{String(session.current_idx + 1).padStart(2, "0")}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">
                de {session.cases.length} casos
              </div>
            </div>
          </div>

          {/* Criteria Reference */}
          <CriteriaLegend />

          {/* Query Image Upload for Current Case */}
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground-heading)]">
                <Icons.Target className="w-4 h-4 text-[#00d2ff]" />
                <span>Foto de Consulta para este caso</span>
              </div>
              <span className="text-xs text-[var(--foreground-muted)]">
                Recuerda: Nunca uses fotos directas del catálogo
              </span>
            </div>

            <input
              ref={queryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            />

            {!queryPreview ? (
              <div
                onClick={() => queryInputRef.current?.click()}
                className="dropzone-container p-8 text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <Icons.Upload className="w-8 h-8 text-[#00d2ff] mb-2" />
                <span className="text-sm font-bold text-[var(--foreground-heading)]">
                  Sube la foto externa correspondiente a este caso
                </span>
                <span className="text-xs text-[var(--foreground-muted)] mt-1">
                  Tomada en tienda, redes sociales o recorte real
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-black/30 border border-[var(--border)] flex-shrink-0">
                  <img
                    src={queryPreview}
                    alt="Consulta actual"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    onClick={() => queryInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-md transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-xs text-[var(--foreground-muted)]">
                    Foto cargada: <b className="text-[var(--foreground)]">{queryFile?.name}</b>
                  </div>

                  {apiResults.length === 0 && (
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="btn-primary-action px-6 py-3 rounded-xl text-sm font-bold"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Consultando buscador...</span>
                        </>
                      ) : (
                        <>
                          <Icons.Search className="w-4 h-4" />
                          <span>Buscar Top 5 en Catálogo →</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Results to rate */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          )}

          {apiResults.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground-heading)]">
                  <Icons.Trophy className="w-4 h-4 text-amber-400" />
                  <span>5 Resultados Obtenidos — Aplica tu Juicio</span>
                </div>
                <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-2">
                  <span>Atajos de teclado:</span>
                  <span className="keycap">1</span> Acierto · <span className="keycap">2</span> Sirve · <span className="keycap">3</span> No sirve
                </div>
              </div>

              <div className="space-y-3">
                {apiResults.map((r, idx) => {
                  const rank = idx + 1;
                  const score = r.score_reranking ?? r.score ?? 0;
                  const isExpected = r.id === currentCase.id_correcto;
                  const currentRating = ratings[r.id];

                  return (
                    <div
                      key={r.id}
                      className={`result-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        isExpected ? "border-emerald-500/40 bg-emerald-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[var(--input-bg)] border border-[var(--border)] flex items-center justify-center font-mono font-bold text-xs text-[var(--foreground-muted)] flex-shrink-0">
                          #{rank}
                        </span>

                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/30 border border-[var(--border)] flex-shrink-0 p-1">
                          <img
                            src={`/api/images/${r.imagen}`}
                            alt={r.nombre}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              if (r.url) (e.target as HTMLImageElement).src = r.url;
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-[var(--foreground-heading)] truncate max-w-xs sm:max-w-md">
                              {r.nombre}
                            </h4>
                            {isExpected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                                ✓ Coincide con ID Esperado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--foreground-muted)] font-mono">
                            {r.id} · score: {score.toFixed(4)}
                          </div>
                        </div>
                      </div>

                      {/* 3 Fixed Verdict Buttons */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleRate(r.id, "Acierto")}
                          className={`verdict-btn flex-1 sm:flex-none ${
                            currentRating === "Acierto"
                              ? "verdict-acierto-active"
                              : "verdict-acierto-idle"
                          }`}
                        >
                          <span className="keycap">1</span>
                          <span>Acierto</span>
                        </button>

                        <button
                          onClick={() => handleRate(r.id, "Sirve")}
                          className={`verdict-btn flex-1 sm:flex-none ${
                            currentRating === "Sirve"
                              ? "verdict-sirve-active"
                              : "verdict-sirve-idle"
                          }`}
                        >
                          <span className="keycap">2</span>
                          <span>Sirve</span>
                        </button>

                        <button
                          onClick={() => handleRate(r.id, "No sirve")}
                          className={`verdict-btn flex-1 sm:flex-none ${
                            currentRating === "No sirve"
                              ? "verdict-nosirve-active"
                              : "verdict-nosirve-idle"
                          }`}
                        >
                          <span className="keycap">3</span>
                          <span>No sirve</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Case CTA */}
              <div className="pt-4">
                <button
                  onClick={handleNextCase}
                  disabled={!allRated}
                  className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all flex items-center justify-center gap-2 ${
                    allRated
                      ? "btn-primary-action shadow-xl hover:shadow-cyan-500/25"
                      : "bg-[var(--input-bg)] text-[var(--foreground-muted)] border border-[var(--border)] opacity-60 cursor-not-allowed"
                  }`}
                >
                  {allRated ? (
                    <>
                      <span>
                        {session.current_idx + 1 >= session.cases.length
                          ? "Finalizar y Ver Métricas Oficiales"
                          : `Guardar y Siguiente Caso (${session.current_idx + 2} / ${session.cases.length})`}
                      </span>
                      <span className="keycap bg-white/20 text-white">[Enter]</span>
                    </>
                  ) : (
                    <span>
                      Califica los {apiResults.length - Object.keys(ratings).length} resultado(s) restantes para avanzar
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
         PHASE 3: DONE (Resumen de Métricas de Negocio)
         ══════════════════════════════════════════════════════════════ */}
      {phase === "done" && session && (
        <section className="space-y-8 animate-fade-in max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <Icons.Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground-heading)]">
              Evaluación Experta Completada
            </h2>
            <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
              {session.evals.length} casos calificados bajo los criterios fijos de la Ficha 03-C
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Precision@1"
              value={metrics.p1}
              description="¿Cuántas veces el primer resultado devuelto fue el diseño correcto?"
              colorScheme="cyan"
            />
            <MetricCard
              label="Recall@5"
              value={metrics.r5}
              description="¿Cuántas veces el diseño correcto apareció dentro del Top 5 devuelto?"
              colorScheme="emerald"
            />
            <MetricCard
              label="Utilidad Top 5"
              value={metrics.util}
              description="De los resultados no exactos (posiciones 2-5), ¿cuántos sirven para el cliente?"
              colorScheme="purple"
            />
          </div>

          {/* Diagnostic Interpretation Rows */}
          <div className="glass-panel p-5 sm:p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-heading)] mb-2">
              Interpretación del Rendimiento para Sublitex
            </h3>
            <InterpretRow label="Precision@1 (Eficiencia del Vendedor)" value={metrics.p1} />
            <InterpretRow label="Recall@5 (Cobertura del Buscador)" value={metrics.r5} />
            <InterpretRow label="Utilidad Top 5 (Calidad de Alternativas)" value={metrics.util} />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => exportCSV(session.evals)}
              className="btn-primary-action w-full sm:flex-1 py-4 text-sm rounded-xl font-bold"
            >
              <Icons.Download className="w-4 h-4" />
              <span>Exportar evaluacion.csv Oficial</span>
            </button>
            <button
              onClick={resetSession}
              className="btn-secondary-action w-full sm:w-auto px-6 py-4 text-sm rounded-xl font-semibold"
            >
              Comenzar Nueva Evaluación
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
