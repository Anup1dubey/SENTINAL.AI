import { severityFromScore } from "../../utils/severity.js";

// Isolated mock stand-in for a real YOLO + XGBoost/Random Forest pipeline.
// Swap the body of analyzeImage() for a call to a real ML service later —
// no other file in the codebase needs to change.

const DEFECT_POOL = [
  { name: "Longitudinal Crack", extraKeys: ["Length", "Width"] },
  { name: "Pothole", extraKeys: ["Area"] },
  { name: "Corrosion", extraKeys: ["Depth"] },
  { name: "Exposed Steel", extraKeys: [] },
  { name: "Surface Fatigue", extraKeys: ["Area"] },
  { name: "Leakage", extraKeys: [] },
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomExtra(key) {
  switch (key) {
    case "Length":
      return [key, `${randomBetween(0.3, 3)}m`];
    case "Width":
      return [key, `${randomBetween(1, 8)}mm`];
    case "Area":
      return [key, `${randomBetween(0.2, 2)}m²`];
    case "Depth":
      return [key, `${randomBetween(0.5, 4)}mm`];
    default:
      return [key, ""];
  }
}

export async function analyzeImage() {
  const detectionCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...DEFECT_POOL].sort(() => Math.random() - 0.5).slice(0, detectionCount);

  const detections = shuffled.map((defect) => {
    const confidence = Math.round(randomBetween(80, 99));
    const score = Math.round(randomBetween(20, 95));
    return {
      name: defect.name,
      severity: severityFromScore(score),
      confidence,
      boundingBox: {
        top: randomBetween(5, 60),
        left: randomBetween(5, 60),
        width: randomBetween(20, 40),
        height: randomBetween(20, 40),
      },
      extra: defect.extraKeys.map(randomExtra),
    };
  });

  const riskScore = Math.max(...detections.map((d) => severityWeight(d)));

  return {
    detections,
    riskScore,
    severity: severityFromScore(riskScore),
  };
}

function severityWeight(detection) {
  const base = { Critical: 85, High: 65, Medium: 45, Low: 20 }[detection.severity];
  return Math.min(100, Math.round(base + (detection.confidence - 85) * 0.3));
}
