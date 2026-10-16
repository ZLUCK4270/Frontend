"use client";

import Link from "next/link";
import { Icons } from "@/components/Icons";

const DEMO_CASES = [
  {
    id: "caso_tienda",
    title: "Foto real tomada en tienda o perchero",
    badge: "Foto de Celular",
    description: "Una foto tomada rápidamente en una tienda departamental con iluminación fluorescente y percheros alrededor.",
    howItWorks: "El sistema segmenta automáticamente el torso de la prenda, eliminando los percheros y el fondo de la tienda para concentrarse en las franjas y el escudo.",
    image: "/images/peru_home.jpg",
    matchedJersey: "Perú 2024 — Camiseta Titular Oficial",
    confidence: "98.5%",
  },
  {
    id: "caso_redes",
    title: "Captura de pantalla de redes sociales",
    badge: "Redes / TV",
    description: "Una captura de pantalla de un reel de Instagram o partido transmitido en vivo donde la camiseta aparece en movimiento.",
    howItWorks: "Normaliza la saturación de color y extrae patrones heráldicos y simetría geométrica para encontrar el club exacto.",
    image: "/images/argentina.jpg",
    matchedJersey: "Argentina 2024 — Edición Tres Estrellas",
    confidence: "97.8%",
  },
  {
    id: "caso_clasico",
    title: "Diseño clásico o retro con cambios de sponsor",
    badge: "Clásico Retro",
    description: "Una camiseta de una temporada pasada que puede tener diferente patrocinador o pequeñas variantes en las mangas.",
    howItWorks: "Compara la estructura de diseño base e identifica alternativas de la misma era que el cliente puede confeccionar.",
    image: "/images/real_madrid.jpg",
    matchedJersey: "Real Madrid 2024 — Edición Blanca Clásica",
    confidence: "96.5%",
  },
  {
    id: "caso_sublimacion",
    title: "Mockup digital para confección de equipo",
    badge: "Diseño Digital",
    description: "Un archivo gráfico plano de un diseño personalizado preparado para la liga de fútbol del fin de semana.",
    howItWorks: "Extrae paletas de color CMYK/RGB y recomienda las mejores telas sublimadas compatibles con esa densidad gráfica.",
    image: "/images/hero_sublimation.jpg",
    matchedJersey: "Sublitex Pro Athletic — Geométrico Azul & Dorado",
    confidence: "97.2%",
  },
];

export default function EvalPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* ── Header ── */}
      <section className="space-y-3">
        <div className="text-xs font-semibold tracking-wider text-[#00d2ff] uppercase">
          Casos Reales y Capacidad del Sistema
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground-heading)] [text-wrap:balance]">
          ¿Qué tipos de fotos reconoce el buscador?
        </h1>
        <p className="text-base text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
          Diseñado para el mundo real: no necesitas fotos de estudio perfectas. Nuestro motor visual reconoce camisetas en situaciones cotidianas de compra y confección.
        </p>
      </section>

      {/* ── Demo Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMO_CASES.map((demo) => (
          <div
            key={demo.id}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[#00d2ff]/40 transition-all flex flex-col justify-between shadow-lg space-y-5"
          >
            <div className="space-y-4">
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[var(--border)] relative">
                <img
                  src={demo.image}
                  alt={demo.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                  {demo.badge}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 backdrop-blur-md">
                  {demo.confidence} acierto
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[var(--foreground-heading)]">
                  {demo.title}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
                  {demo.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] text-xs space-y-1">
                <span className="text-[#00d2ff] font-semibold block text-[11px]">
                  ¿Cómo lo procesa el buscador?
                </span>
                <p className="text-[var(--foreground-muted)] leading-relaxed">
                  {demo.howItWorks}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
              <div className="text-xs">
                <span className="text-[var(--foreground-subtle)]">Resultado: </span>
                <span className="font-semibold text-[var(--foreground-heading)]">
                  {demo.matchedJersey}
                </span>
              </div>

              <Link
                href="/search"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00d2ff] hover:bg-[#00b4db] text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Probar en buscador</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* ── Helpful Tips for Customers ── */}
      <section className="p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white/[0.03] to-transparent space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#00d2ff] flex items-center gap-2">
          <Icons.Camera className="w-4 h-4" />
          <span>Consejos para obtener el resultado más preciso</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--foreground-muted)]">
          <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="font-bold text-[var(--foreground-heading)]">1. Iluminación frontal</div>
            <p className="leading-relaxed">
              Evita sombras fuertes sobre el pecho para que los colores primarios y las franjas se distingan claramente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="font-bold text-[var(--foreground-heading)]">2. Muestra el torso completo</div>
            <p className="leading-relaxed">
              Enfoca el pecho y cuello de la camiseta donde se encuentran el escudo y el patrón principal del diseño.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="font-bold text-[var(--foreground-heading)]">3. Capturas de pantalla son válidas</div>
            <p className="leading-relaxed">
              Si viste la camiseta en Instagram, TikTok o TV, tómale una captura y súbela directamente con Ctrl+V.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
