"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { Icons } from "./Icons";
import type { HealthInfo } from "@/lib/types";
import { healthCheck } from "@/lib/api";

type Tab = "search" | "test" | "config";

const TABS: { id: Tab; label: string; icon: typeof Icons.Search; href?: string }[] = [
  { id: "search", label: "Búsqueda Visual", icon: Icons.Search, href: "/search" },
  { id: "test", label: "Evaluación Humana", icon: Icons.Flask, href: "/eval" },
  { id: "config", label: "Configuración", icon: Icons.Settings },
];

function SidebarContent({
  activeTab,
  setActiveTab,
  apiUrl,
  urlInput,
  setUrlInput,
  health,
  healthError,
  checking,
  handleCheck,
  theme,
  toggleTheme,
  howOpen,
  setHowOpen,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  pathname: string;
  apiUrl: string;
  urlInput: string;
  setUrlInput: (v: string) => void;
  health: HealthInfo | null;
  healthError: string | null;
  checking: boolean;
  handleCheck: () => void;
  theme: string;
  toggleTheme: () => void;
  howOpen: boolean;
  setHowOpen: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Segment Controls */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="grid grid-cols-3 gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-b from-[#00d2ff]/20 to-[#0077ff]/20 text-[#00d2ff] shadow-sm border border-[#00d2ff]/30"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="truncate text-[11px]">{tab.id === "search" ? "Buscar" : tab.id === "test" ? "Test" : "Config"}</span>
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-b from-[#00d2ff]/20 to-[#0077ff]/20 text-[#00d2ff] shadow-sm border border-[#00d2ff]/30"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate text-[11px]">Config</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ══════════ Búsqueda Tab ══════════ */}
        {activeTab === "search" && (
          <>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00d2ff] mb-2">
                <Icons.Zap className="w-3.5 h-3.5" />
                <span>Motor Activo</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#00d2ff]/30 bg-gradient-to-br from-[#00d2ff]/10 via-[#0077ff]/5 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-[#00d2ff] text-sm">⚡ Fusión Multimodal</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d2ff]/20 text-[#00d2ff]">
                    Hito 2/3
                  </span>
                </div>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  Ensemble de 3 representaciones: <b>CLIP</b> (512d) + <b>OpenCLIP</b> (512d) + <b>SigLIP</b> (768d).
                  Inmune a recortes de catálogo, variaciones de color y personas.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <Icons.Target className="w-3.5 h-3.5" />
                <span>Identificación Automática</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300/90 leading-relaxed">
                Clasifica <b>país</b>, <b>selección</b> y <b>diseño</b> analizando la composición cromática dominante y elementos heráldicos.
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <button
                onClick={() => setHowOpen(!howOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-[var(--foreground)] hover:text-[#00d2ff] transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Icons.Layers className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                  ¿Cómo funciona el pipeline?
                </span>
                <Icons.ChevronDown
                  className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-200 ${
                    howOpen ? "rotate-180 text-[#00d2ff]" : ""
                  }`}
                />
              </button>
              {howOpen && (
                <ol className="mt-2.5 text-xs text-[var(--foreground-muted)] space-y-2 list-none leading-relaxed">
                  <li className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span><b>Carga:</b> Subes una foto (JPG/PNG), incluso tomada con celular en tienda.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span><b>Preprocesamiento:</b> Segmenta el torso y normaliza fondo para evitar ruido.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span><b>Indexación:</b> Recupera candidatos con similitud coseno contra la base vectorial.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <span><b>Reranking:</b> Reordena el Top 5 según coherencia de color HSV y estructura de patrón.</span>
                  </li>
                </ol>
              )}
            </div>
          </>
        )}

        {/* ══════════ Test Tab ══════════ */}
        {activeTab === "test" && (
          <>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Icons.Keyboard className="w-3.5 h-3.5" />
                <span>Criterios de Juicio Fijos</span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mb-2.5">
                Obligatorios según <code>DECISIONES.md</code> — evita sesgos subjetivos:
              </p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                    <span className="keycap bg-emerald-500/20 text-emerald-300">1</span>
                    Acierto
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-tight">
                    Mismo diseño, aunque varíe color, año, sponsor o escudo.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-0.5">
                    <span className="keycap bg-amber-500/20 text-amber-300">2</span>
                    Sirve
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-tight">
                    No es el mismo, pero el vendedor se lo ofrecería al cliente como alternativa válida.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-0.5">
                    <span className="keycap bg-rose-500/20 text-rose-300">3</span>
                    No sirve
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-tight">
                    Diseño completamente distinto. Inaceptable como sustituto.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00d2ff] mb-2">
                <Icons.Trophy className="w-3.5 h-3.5" />
                <span>Métricas de Calidad</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                  <span className="font-mono font-bold text-[#00d2ff]">Precision@1</span>
                  <span className="text-[var(--foreground-muted)] text-[11px]">¿El 1ro es el correcto?</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                  <span className="font-mono font-bold text-[#00d2ff]">Recall@5</span>
                  <span className="text-[var(--foreground-muted)] text-[11px]">¿El correcto está en Top 5?</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-mono font-bold text-[#00d2ff]">Utilidad Top 5</span>
                  <span className="text-[var(--foreground-muted)] text-[11px]">¿Alternativas comerciales?</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════ Config Tab ══════════ */}
        {activeTab === "config" && (
          <>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)]">Modo visual</span>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
                >
                  {theme === "dark" ? (
                    <>
                      <Icons.Moon className="w-3.5 h-3.5 text-[#00d2ff]" />
                      Oscuro
                    </>
                  ) : (
                    <>
                      <Icons.Sun className="w-3.5 h-3.5 text-amber-500" />
                      Claro
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
                Dirección API FastAPI
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--foreground)] text-xs font-mono focus:outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition-all"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={checking}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-[var(--btn-primary-text)] bg-gradient-to-r from-[#00d2ff] to-[#0077ff] hover:shadow-lg hover:shadow-cyan-500/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Probando API...</span>
                </>
              ) : (
                <>
                  <Icons.Refresh className="w-3.5 h-3.5" />
                  <span>Verificar Conexión</span>
                </>
              )}
            </button>

            {healthError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed flex items-start gap-2">
                <Icons.AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{healthError}</span>
              </div>
            )}

            {health && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  <span className="text-xs font-bold text-emerald-400">Servicio Operativo</span>
                </div>
                <div className="text-[11px] text-[var(--foreground-muted)] space-y-0.5">
                  <div><b>Catálogo:</b> {health.products?.toLocaleString()} productos</div>
                  <div><b>Vectores:</b> {health.embeddings?.toLocaleString()} embeddings</div>
                  <div><b>Modelo:</b> <code className="text-emerald-300 font-mono text-[10px]">{health.model}</code></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  apiUrl,
  onApiUrlChange,
  health,
  onHealthChange,
  sidebarOpen,
  onToggle,
  onClose,
}: {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  health: HealthInfo | null;
  onHealthChange: (h: HealthInfo | null) => void;
  sidebarOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>(
    pathname.startsWith("/eval") ? "test" : "search"
  );
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  const handleCheck = async () => {
    onApiUrlChange(urlInput);
    setChecking(true);
    setHealthError(null);
    const { data, error } = await healthCheck(urlInput);
    setChecking(false);
    if (error) {
      setHealthError(error);
      onHealthChange(null);
    } else {
      onHealthChange(data);
    }
  };

  const sharedProps = {
    activeTab,
    setActiveTab,
    pathname,
    apiUrl,
    urlInput,
    setUrlInput,
    health,
    healthError,
    checking,
    handleCheck,
    theme,
    toggleTheme: toggle,
    howOpen,
    setHowOpen,
  };

  return (
    <>
      {/* ══ Mobile: Slide-over Drawer with Backdrop ══ */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
            onClick={onClose}
          />
        )}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-80 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border)] backdrop-blur-2xl transition-transform duration-300 ease-in-out shadow-2xl ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Icons.Shirt className="w-5 h-5 text-[#00d2ff]" />
              <span className="text-sm font-extrabold text-[var(--foreground)]">Panel de Control</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/10 transition-colors"
              aria-label="Cerrar panel"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
          <SidebarContent {...sharedProps} />
        </aside>
      </div>

      {/* ══ Desktop: Permanent / Collapsible Rail ══ */}
      <aside
        style={{
          width: sidebarOpen ? "18rem" : "4rem",
          minWidth: sidebarOpen ? "18rem" : "4rem",
        }}
        className="hidden lg:flex fixed top-0 left-0 z-40 h-full flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border)] backdrop-blur-2xl transition-all duration-300 ease-in-out select-none shadow-xl"
      >
        {sidebarOpen ? (
          <>
            {/* Header with collapse button */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
                  <Icons.Shirt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Navegación
                </span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 active:scale-95 transition-all"
                aria-label="Colapsar panel lateral"
                title="Colapsar barra lateral"
              >
                <Icons.ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <SidebarContent {...sharedProps} />
          </>
        ) : (
          /* Collapsed Rail View */
          <div className="flex flex-col items-center py-4 h-full justify-between">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onToggle}
                className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] flex items-center justify-center text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all shadow-sm"
                title="Expandir barra lateral"
              >
                <Icons.Shirt className="w-5 h-5" />
              </button>

              <div className="w-8 h-[1px] bg-[var(--border)] my-1" />

              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href || "#"}
                    onClick={(e) => {
                      if (!tab.href) {
                        e.preventDefault();
                        setActiveTab(tab.id);
                        onToggle();
                      }
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 shadow-sm"
                        : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                    }`}
                    title={tab.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggle}
                className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-all"
                title="Cambiar tema"
              >
                {theme === "dark" ? <Icons.Sun className="w-4 h-4 text-amber-400" /> : <Icons.Moon className="w-4 h-4 text-sky-600" />}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
