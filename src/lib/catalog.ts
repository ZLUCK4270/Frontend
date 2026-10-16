export interface CatalogJersey {
  id: string;
  name: string;
  team: string;
  country: string;
  league: string;
  season: string;
  type: "Local" | "Visitante" | "Alternativa" | "Retro" | "Especial";
  colors: string[];
  colorHexes: string[];
  image: string;
  description: string;
  sublimationSpecs: {
    fabric: string;
    collar: string;
    sleeve: string;
    printType: string;
  };
  sampleQueryId?: string;
}

export const CATALOG_JERSEYS: CatalogJersey[] = [
  {
    id: "AIM-PER-2024-H",
    name: "Perú 2024 — Camiseta Titular Oficial",
    team: "Selección Peruana",
    country: "Perú",
    league: "Conmebol / Clasificatorias",
    season: "2024 / 2025",
    type: "Local",
    colors: ["Blanco", "Rojo", "Dorado"],
    colorHexes: ["#FFFFFF", "#D90429", "#D4AF37"],
    image: "/images/peru_home.jpg",
    description: "Clásica franja diagonal roja sobre fondo blanco puro, escudo de la FPF con ribete dorado y cuello tejido elástico.",
    sublimationSpecs: {
      fabric: "Win Dry-Fit Microperforado 140g",
      collar: "Rib elástico bicolor en V",
      sleeve: "Puño anatómico sublimado",
      printType: "Sublimación digital HD 1200 DPI",
    },
    sampleQueryId: "peru",
  },
  {
    id: "AIM-ARG-2024-H",
    name: "Argentina 2024 — Edición Tres Estrellas",
    team: "Selección Argentina",
    country: "Argentina",
    league: "Conmebol / Campeón del Mundo",
    season: "2024",
    type: "Local",
    colors: ["Celeste", "Blanco", "Dorado"],
    colorHexes: ["#75AADB", "#FFFFFF", "#D4AF37"],
    image: "/images/argentina.jpg",
    description: "Bastones verticales celestes y blancos con la tercera estrella conmemorativa y parche dorado oficial de campeón.",
    sublimationSpecs: {
      fabric: "Poliéster Dry-Tech transpirable",
      collar: "Cuello en V cruzado con vivo celeste",
      sleeve: "Manga corta con terminación termosellada",
      printType: "Transfer de alta definición y sublimación",
    },
    sampleQueryId: "argentina",
  },
  {
    id: "AIM-RMA-2024-H",
    name: "Real Madrid 2024 — Edición Blanca Clásica",
    team: "Real Madrid CF",
    country: "España",
    league: "La Liga / Champions League",
    season: "2023 / 2024",
    type: "Local",
    colors: ["Blanco", "Dorado", "Azul Marino"],
    colorHexes: ["#FFFFFF", "#D4AF37", "#00204A"],
    image: "/images/real_madrid.jpg",
    description: "Diseño blanco inmaculado con detalles dorados en hombros y puños, con escudo bordado texturizado.",
    sublimationSpecs: {
      fabric: "Interlock técnico anti-sudor 150g",
      collar: "Cuello redondo con costura reforzada",
      sleeve: "Manga ranglán para mayor movilidad",
      printType: "Sublimación directa sin tacto",
    },
    sampleQueryId: "madrid",
  },
  {
    id: "AIM-FCB-2024-H",
    name: "FC Barcelona 2024 — Blaugrana Tradicional",
    team: "FC Barcelona",
    country: "España",
    league: "La Liga",
    season: "2024",
    type: "Local",
    colors: ["Azul", "Granate", "Dorado"],
    colorHexes: ["#004D98", "#A50044", "#EDBB00"],
    image: "/images/barcelona.jpg",
    description: "Franjas anchas blaugrana con degradado moderno y escudo del Barça a todo color en el pecho.",
    sublimationSpecs: {
      fabric: "Dry-Action transpirable con filtro UV",
      collar: "Cuello cuello redondo elástico",
      sleeve: "Manga ajustada con ventilación lateral",
      printType: "Sublimación reactiva de alta solidez",
    },
    sampleQueryId: "barcelona",
  },
  {
    id: "AIM-BOC-2024-H",
    name: "Boca Juniors 2024 — Azul y Oro de La Bombonera",
    team: "Club Atlético Boca Juniors",
    country: "Argentina",
    league: "Liga Profesional de Fútbol",
    season: "2024",
    type: "Local",
    colors: ["Azul", "Amarillo Oro"],
    colorHexes: ["#003882", "#FFC72C"],
    image: "/images/boca_juniors.jpg",
    description: "Azul rey emblemático con la histórica franja amarilla en el pecho y cuello acanalado con detalles del club.",
    sublimationSpecs: {
      fabric: "Win Cool 140g textura nido de abeja",
      collar: "Rib redondo elastizado",
      sleeve: "Manga clásica con vivo amarillo",
      printType: "Sublimación digital a 200°C",
    },
    sampleQueryId: "boca",
  },
  {
    id: "AIM-SUB-PRO-01",
    name: "Sublitex Pro Athletic — Geométrico Azul & Dorado",
    team: "Diseño Personalizado Sublitex",
    country: "Perú / Internacional",
    league: "Edición Deportiva Especial",
    season: "2025 Colección",
    type: "Especial",
    colors: ["Azul Noche", "Dorado", "Blanco"],
    colorHexes: ["#0B1B3D", "#C5A059", "#FFFFFF"],
    image: "/images/hero_sublimation.jpg",
    description: "Diseño de vanguardia con trama geométrica fractal, contraste azul noche y detalles dorados para equipos de alto rendimiento.",
    sublimationSpecs: {
      fabric: "Microfibra deportiva importada Dry-Max",
      collar: "Cuello deportivo en V anatómico",
      sleeve: "Corte athletic pro ajustado",
      printType: "Sublimación total 360° sin límites de color",
    },
    sampleQueryId: "sublitex",
  },
];
