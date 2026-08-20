// ------------------------------------------------------------------
//  SENTINEL AI — STATIC/MARKETING DATA
//  Live domain data (assets, dashboard stats, priority queue, reports,
//  inspection results) now comes from the real backend API (see
//  src/api/*). What's left here is genuinely static: theme colors, the
//  public landing page's illustrative stats, the pipeline explainer
//  copy, and the Live Demo preset scenarios.
// ------------------------------------------------------------------

export const COLORS = {
  green: "#1DB954",
  greenBright: "#1ED760",
  red: "#F15E6C",
  orange: "#FF8C42",
  yellow: "#F5C94D",
  gray: "#B3B3B3",
  grayDim: "#727272",
};

export const SEVERITY_STYLE = {
  Critical: { fg: COLORS.red, bg: "rgba(241,94,108,0.14)" },
  High: { fg: COLORS.orange, bg: "rgba(255,140,66,0.14)" },
  Medium: { fg: COLORS.yellow, bg: "rgba(245,201,77,0.14)" },
  Low: { fg: COLORS.green, bg: "rgba(29,185,84,0.14)" },
};

// Illustrative stats shown on the public landing page (Hero) before
// sign-in — deliberately static rather than pulled from the
// authenticated dashboard API.
export const SUMMARY_STATS = [
  { label: "Critical Issues", value: "12", sub: "Immediate attention", color: COLORS.red },
  { label: "High Risk Assets", value: "27", sub: "Action within 14 days", color: COLORS.orange },
  { label: "Medium Risk Assets", value: "64", sub: "Monitor closely", color: COLORS.yellow },
  { label: "Assets Monitored", value: "1,284", sub: "Across region", color: COLORS.green },
];

// The 6-step pipeline shown in the Pipeline section, each with a short
// burst of contextual "data feed" lines that stream in beside it.
// Purely explanatory marketing content, unrelated to live data.
export const PIPELINE_STEPS = [
  {
    id: 1,
    title: "Image Upload",
    description: "Field crews or fixed cameras submit an infrastructure image for review.",
    feed: ["road_frame_0182.jpg received", "resolution 4032×3024", "geo-tag: Baner Road, Pune"],
  },
  {
    id: 2,
    title: "Damage Detection",
    description: "Candidate defect regions are localized within the frame.",
    feed: ["region_1: crack (0.96)", "region_2: pothole (0.91)", "region_3: corrosion (0.87)"],
  },
  {
    id: 3,
    title: "Feature Extraction",
    description: "Each defect region is measured for extent and geometry.",
    feed: ["crack length: 1.8m", "crack width: 4.2mm", "pothole area: 0.82m²"],
  },
  {
    id: 4,
    title: "Risk Prediction",
    description: "Defect features are combined with asset context into a composite score.",
    feed: ["severity weight: 0.62", "context weight: 0.24", "extent weight: 0.14"],
  },
  {
    id: 5,
    title: "Priority Ranking",
    description: "The asset is ranked against the rest of the monitored network.",
    feed: ["composite score: 82 / 100", "rank: #1 of 1,284", "priority: P1 — Critical"],
  },
  {
    id: 6,
    title: "Dashboard / Report",
    description: "Results are pushed to the live dashboard and maintenance report.",
    feed: ["dashboard updated", "priority queue +1", "report draft generated"],
  },
];

// Loading-checklist labels shown while a real inspection analysis is in flight.
export const STAGES = ["Image Upload", "Damage Detection", "Feature Extraction", "Risk Prediction", "Priority Ranking"];

// Selectable presets for the Live Demo section — each maps to a
// pre-seeded real asset (see backend/scripts/seedDemoAssets.js) and a
// bundled placeholder image, so choosing one still submits a real
// analysis request instead of faking a result client-side.
export const DEMO_PRESETS = [
  {
    id: "road-crack",
    label: "Cracked Arterial Road",
    assetId: "ROAD-0234",
    location: "Baner Road, Pune",
    type: "Road",
    thumbGradient: "from-[#3a2a1a] to-[#1a1108]",
    image: "/demo/road-crack.jpg",
  },
  {
    id: "bridge-corrosion",
    label: "Corroded Bridge Girder",
    assetId: "BRIDGE-0087",
    location: "Mumbai-Pune Highway",
    type: "Bridge",
    thumbGradient: "from-[#2a1a1a] to-[#100808]",
    image: "/demo/bridge-corrosion.jpg",
  },
  {
    id: "flyover-fatigue",
    label: "Flyover Surface Fatigue",
    assetId: "FLYOVER-0021",
    location: "Shivajinagar",
    type: "Flyover",
    thumbGradient: "from-[#1a2a1e] to-[#08100b]",
    image: "/demo/flyover-fatigue.jpg",
  },
];
