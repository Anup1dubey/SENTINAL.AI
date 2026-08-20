import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { STAGES, DEMO_PRESETS, COLORS, SEVERITY_STYLE } from "../data";
import SignalBars from "./SignalBars";
import * as inspectionsApi from "../api/inspectionsApi";
import * as priorityQueueApi from "../api/priorityQueueApi";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const RECOMMENDED_ACTION = {
  Critical: "Inspect within 7 days",
  High: "Schedule inspection within 14 days",
  Medium: "Routine monitoring",
  Low: "Scheduled maintenance",
};

async function urlToFile(url, filename) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export default function LiveDemo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpload = user?.role === "admin" || user?.role === "inspector";

  const [uploaded, setUploaded] = useState(null);
  const [preset, setPreset] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const fileInputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleFile = (file) => {
    if (!file) return;
    setPreset(null);
    const reader = new FileReader();
    reader.onload = (e) => setUploaded({ file, dataUrl: e.target.result, name: file.name, size: file.size });
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const choosePreset = (p) => {
    setUploaded(null);
    setPreset(p);
    setDone(false);
    setAdded(false);
    setError("");
  };

  const reset = () => {
    setUploaded(null);
    setPreset(null);
    setDone(false);
    setAdded(false);
    setStageIdx(-1);
    setResult(null);
    setError("");
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setDone(false);
    setError("");
    setStageIdx(-1);
    timers.current.forEach(clearTimeout);
    timers.current = STAGES.map((_, i) => setTimeout(() => setStageIdx(i), 500 * (i + 1)));

    try {
      const formData = new FormData();
      if (preset) {
        const file = await urlToFile(preset.image, `${preset.id}.jpg`);
        formData.append("image", file);
        formData.append("assetId", preset.assetId);
      } else {
        formData.append("image", uploaded.file);
        formData.append("type", "Road");
        formData.append("location", "Unregistered Field Upload");
        formData.append("coordinatesX", String(Math.round(10 + Math.random() * 80)));
        formData.append("coordinatesY", String(Math.round(10 + Math.random() * 80)));
      }

      const { inspection } = await inspectionsApi.create(formData);

      timers.current.forEach(clearTimeout);
      setStageIdx(STAGES.length - 1);
      setResult(inspection);
      setAnalyzing(false);
      setDone(true);
    } catch (err) {
      timers.current.forEach(clearTimeout);
      setAnalyzing(false);
      setError(err instanceof ApiError ? err.message : "Analysis failed. Please try again.");
    }
  };

  const addToPriorityQueue = async () => {
    if (!result) return;
    setAddingToQueue(true);
    try {
      await priorityQueueApi.create({
        assetId: result.asset._id || result.asset,
        inspectionId: result._id,
        defect: result.detections[0]?.name || "Detected defect",
        severity: result.severity,
        score: result.riskScore,
        action: RECOMMENDED_ACTION[result.severity] || "Routine monitoring",
      });
      setAdded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add to priority queue.");
    } finally {
      setAddingToQueue(false);
    }
  };

  const fmtSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
  const hasInput = uploaded || preset;
  const score = result?.riskScore ?? 0;
  const severity = result?.severity ?? "Low";
  const detections = result?.detections ?? [];
  const previewSrc = uploaded ? uploaded.dataUrl : preset?.image;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);
  const severityColor = SEVERITY_STYLE[severity]?.fg ?? COLORS.green;

  return (
    <section id="live-demo" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-widest text-green uppercase">Live Demo</span>
        <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
          Run a real inspection
        </h2>
        <p className="text-gray text-sm md:text-base mt-4">
          Upload your own image or pick a preset scenario. This calls the real backend — the image is stored and
          analyzed by the (currently mocked) detection service, and the result is persisted.
        </p>
      </div>

      {!canUpload && (
        <div className="mb-6 rounded-xl px-4 py-3 text-xs font-semibold text-yellow max-w-2xl" style={{ background: "rgba(245,201,77,0.1)" }}>
          Your account has read-only (viewer) access. Sign in as a field inspector to run new analyses.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-xs font-semibold text-red max-w-2xl" style={{ background: "rgba(241,94,108,0.1)" }}>
          {error}
        </div>
      )}

      {!hasInput && !done && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => canUpload && fileInputRef.current?.click()}
            className="lg:col-span-2 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center py-14 px-6 transition-colors"
            style={{
              borderColor: dragOver ? "#1DB954" : "rgba(255,255,255,0.08)",
              background: dragOver ? "rgba(29,185,84,0.06)" : "#181818",
              cursor: canUpload ? "pointer" : "not-allowed",
              opacity: canUpload ? 1 : 0.6,
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(29,185,84,0.14)" }}>
              <UploadIcon size={24} className="text-green" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Upload Infrastructure Image</h3>
            <p className="text-sm text-gray">
              Drag and drop your image here, or <span className="text-green">browse from your device</span>
            </p>
            <p className="text-[11px] mt-3 text-grayDim">Supported formats: JPG · PNG · WEBP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={!canUpload}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="rounded-2xl border border-line bg-card p-5">
            <h4 className="text-white font-bold text-sm mb-1">Or try a preset</h4>
            <p className="text-xs text-grayDim mb-4">No image? Use a ready-made scenario.</p>
            <div className="space-y-2.5">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => canUpload && choosePreset(p)}
                  disabled={!canUpload}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-line hover:border-green/50 hover:bg-cardHover transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${p.thumbGradient} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{p.label}</div>
                    <div className="text-[10px] text-grayDim truncate">{p.assetId} · {p.location}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasInput && !analyzing && !done && (
        <div className="rounded-2xl border border-line bg-card p-5 max-w-2xl">
          <div className="flex items-center gap-4">
            {uploaded ? (
              <img src={uploaded.dataUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-line" />
            ) : (
              <div className={`w-24 h-24 rounded-xl shrink-0 bg-gradient-to-br ${preset.thumbGradient}`} />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm truncate flex items-center gap-2">
                <ImageIcon size={14} className="text-green" /> {uploaded ? uploaded.name : preset.label}
              </div>
              <div className="text-xs mt-1 text-grayDim">
                {uploaded ? fmtSize(uploaded.size) : `${preset.assetId} · ${preset.location}`}
              </div>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full shrink-0 text-red" style={{ background: "rgba(241,94,108,0.1)" }}>
              <Trash2 size={13} /> Remove
            </button>
          </div>
          <button
            onClick={runAnalysis}
            className="w-full mt-5 py-3.5 rounded-full font-bold text-sm bg-green text-black hover:bg-greenBright transition-colors"
          >
            Analyze Infrastructure
          </button>
        </div>
      )}

      {analyzing && (
        <div className="max-w-md">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: "#1DB95433", borderTopColor: "#1DB954" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <UploadIcon size={20} className="text-green" />
            </div>
          </div>
          <h3 className="text-white font-bold text-base mb-4">Analyzing Infrastructure...</h3>
          <div className="space-y-2">
            {STAGES.map((s, i) => {
              const isDone = i <= stageIdx;
              const current = i === stageIdx;
              return (
                <div key={s} className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
                  style={{ background: isDone ? "rgba(29,185,84,0.08)" : "#181818", border: `1px solid ${isDone ? "#1DB95444" : "rgba(255,255,255,0.08)"}` }}>
                  {isDone ? <CheckCircle2 size={17} className="text-green" /> : <Circle size={17} className={`text-grayDim ${current ? "animate-pulse" : ""}`} />}
                  <span className="text-sm font-semibold" style={{ color: isDone ? "#fff" : "#727272" }}>{s}</span>
                  {isDone && <span className="ml-auto text-[11px] font-bold text-green">Complete</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {done && result && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-line bg-card p-5">
              <h4 className="text-white font-bold text-sm mb-3">Image Analysis Model</h4>
              <div className="relative rounded-xl overflow-hidden bg-[#1a1a1a]" style={{ aspectRatio: "4/3" }}>
                {previewSrc && <img src={previewSrc} alt="analysis" className="w-full h-full object-cover" />}
                {detections.map((d, i) => {
                  const color = SEVERITY_STYLE[d.severity]?.fg ?? COLORS.green;
                  const box = d.boundingBox || {};
                  return (
                    <div
                      key={i}
                      className="absolute rounded-md"
                      style={{
                        top: `${box.top ?? 10}%`,
                        left: `${box.left ?? 10}%`,
                        width: `${box.width ?? 30}%`,
                        height: `${box.height ?? 30}%`,
                        border: `2px solid ${color}`,
                        boxShadow: `0 0 12px ${color}55`,
                      }}
                    >
                      <span className="absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: color, color: "#000" }}>
                        {d.name.toUpperCase()} — {d.confidence}% Confidence
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card p-5">
              <h4 className="text-white font-bold text-sm mb-3">{detections.length} Defects Detected</h4>
              <div className="space-y-3">
                {detections.map((d, i) => (
                  <div key={i} className="rounded-xl p-4 bg-elevated border border-line">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm uppercase tracking-wide">{d.name}</span>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ color: SEVERITY_STYLE[d.severity]?.fg, background: "rgba(255,255,255,0.05)" }}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-grayDim">
                      <span>Confidence: <b className="text-white">{d.confidence}%</b></span>
                      {(d.extra || []).map(([k, v]) => <span key={k}>{k}: <b className="text-white">{v}</b></span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#1F1F1F" strokeWidth="10" />
                    <circle cx="64" cy="64" r="54" fill="none" stroke={severityColor} strokeWidth="10"
                      strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">{score}</span>
                    <span className="text-[10px] text-grayDim">/ 100</span>
                    <span className="text-[10px] font-bold mt-0.5" style={{ color: severityColor }}>{severity.toUpperCase()}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold mt-3 text-gray">Maintenance Risk Score</span>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs leading-relaxed text-grayDim">
                  Composite score based on detected defect severity, defect extent and infrastructure context.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <SignalBars mode="value" values={[score, score * 0.7, score * 0.4]} colors={[severityColor, severityColor, severityColor]} size="lg" />
                  <span className="text-xs text-grayDim">Relative signal strength across defect regions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={addToPriorityQueue} disabled={added || addingToQueue} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm bg-green text-black disabled:opacity-70">
              {added ? <><CheckCircle2 size={16} /> Added to Queue</> : <><Plus size={16} /> {addingToQueue ? "Adding…" : "Add to Priority Queue"}</>}
            </button>
            <button onClick={() => navigate("/dashboard")} className="flex-1 py-3 rounded-full font-bold text-sm bg-elevated text-white border border-line">
              View Dashboard
            </button>
            <button onClick={() => navigate("/reports")} className="flex-1 py-3 rounded-full font-bold text-sm bg-elevated text-white border border-line">
              Generate Report
            </button>
          </div>
          <div className="text-center">
            <button onClick={reset} className="text-xs font-semibold text-grayDim hover:text-white transition-colors">
              ← Run another inspection
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
