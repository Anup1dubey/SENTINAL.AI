import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Share2, Download, Plus, Check } from "lucide-react";
import jsPDF from "jspdf";
import { COLORS } from "../data";
import * as reportsApi from "../api/reportsApi";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const REPORT_TYPES = [
  { value: "monthly", label: "Monthly Infrastructure Health" },
  { value: "critical", label: "Critical Infrastructure" },
  { value: "road", label: "Road Damage" },
  { value: "maintenance", label: "Maintenance Priority" },
];

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[11px] mt-0.5 text-grayDim">{label}</div>
    </div>
  );
}

function exportReportPdf(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - marginX * 2;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(report.title, marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date(report.createdAt).toLocaleDateString()}`, marginX, y);
  y += 26;

  doc.setTextColor(30);
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(report.summary, maxWidth);
  doc.text(summaryLines, marginX, y);
  y += summaryLines.length * 14 + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Key Stats", marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  [
    `Total Assets: ${report.stats.assetsAnalyzed}`,
    `Critical Issues: ${report.stats.critical}`,
    `High Risk: ${report.stats.high}`,
    `Medium Risk: ${report.stats.medium}`,
  ].forEach((line) => {
    doc.text(line, marginX, y);
    y += 14;
  });
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detected Damage Distribution", marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (report.topDefects.length === 0) {
    doc.text("No detections recorded for this report yet.", marginX, y);
    y += 14;
  } else {
    report.topDefects.forEach((d) => {
      doc.text(`${d.name}: ${d.pct}%`, marginX, y);
      y += 14;
    });
  }
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Prioritized Recommended Actions", marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  report.actions.forEach((a) => {
    const lines = doc.splitTextToSize(`• ${a}`, maxWidth);
    doc.text(lines, marginX, y);
    y += lines.length * 14 + 4;
  });

  const filename = `${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
  doc.save(filename);
}

export default function Reports() {
  const { user, logout } = useAuth();
  const canGenerate = user?.role === "admin" || user?.role === "inspector";
  const navigate = useNavigate();
  const { id } = useParams();

  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [copied, setCopied] = useState(false);

  const swatch = [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.green];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const { reports: list } = await reportsApi.list({ limit: 50 });
        if (cancelled) return;
        setReports(list);

        if (id) {
          const found = list.find((r) => r._id === id);
          if (found) {
            setActive(found);
          } else {
            const { report } = await reportsApi.getOne(id);
            if (cancelled) return;
            setActive(report);
            setReports((prev) => (prev.some((r) => r._id === report._id) ? prev : [report, ...prev]));
          }
        } else {
          setActive(list[0] || null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setError("That report could not be found.");
          setActive(null);
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to load reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, logout]);

  const selectReport = (r) => {
    setActive(r);
    setCopied(false);
    navigate(`/reports/${r._id}`, { replace: true });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const { report } = await reportsApi.generate({ type: reportType });
      setReports((prev) => [report, ...prev]);
      selectReport(report);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!active) return;
    const url = `${window.location.origin}/reports/${active._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link to your clipboard.");
    }
  };

  const handleExport = () => {
    if (!active) return;
    exportReportPdf(active);
  };

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="flex items-start justify-between flex-wrap gap-6 mb-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-widest text-green uppercase">Reports</span>
          <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">
            Reports &amp; Recommendations
          </h2>
          <p className="text-gray text-sm md:text-base mt-4">
            Review infrastructure inspection findings and maintenance priorities.
          </p>
        </div>

        {canGenerate && (
          <div className="flex items-center gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2.5 rounded-full text-xs font-semibold bg-elevated text-white border border-line outline-none"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-green text-black hover:bg-greenBright transition-colors disabled:opacity-60"
            >
              <Plus size={14} /> {generating ? "Generating…" : "Generate Report"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-xs font-semibold text-red max-w-2xl" style={{ background: "rgba(241,94,108,0.1)" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray text-sm py-16">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center">
          <p className="text-gray text-sm">No reports yet.</p>
          {canGenerate && <p className="text-grayDim text-xs mt-1">Generate one above to get started.</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {reports.map((r) => (
              <div key={r._id} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(29,185,84,0.14)" }}>
                    <FileText size={16} className="text-green" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{r.title}</div>
                    <div className="text-[11px] text-grayDim">Generated {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-6 text-xs mb-4">
                  <div>
                    <div className="text-grayDim">Assets Analyzed</div>
                    <div className="font-bold text-white">{r.stats.assetsAnalyzed}</div>
                  </div>
                  <div>
                    <div className="text-grayDim">Critical Issues</div>
                    <div className="font-bold text-red">{r.stats.critical} Detected</div>
                  </div>
                </div>
                <button
                  onClick={() => selectReport(r)}
                  className="w-full py-2.5 rounded-full text-xs font-bold transition-colors"
                  style={{
                    background: active?._id === r._id ? "#1DB954" : "#1F1F1F",
                    color: active?._id === r._id ? "#000" : "#fff",
                    border: `1px solid ${active?._id === r._id ? "#1DB954" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {active?._id === r._id ? "Currently Previewing" : "View Report"}
                </button>
              </div>
            ))}
          </div>

          {active && (
            <div className="rounded-2xl border border-line bg-card p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-green">Report Preview</div>
                  <h3 className="text-white font-bold text-lg">{active.title}</h3>
                  <p className="text-xs mt-1 max-w-xl text-grayDim">{active.summary}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-elevated text-white border border-line hover:bg-cardHover transition-colors"
                  >
                    {copied ? <><Check size={13} className="text-green" /> Link Copied</> : <><Share2 size={13} /> Share</>}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-green text-black hover:bg-greenBright transition-colors"
                  >
                    <Download size={13} /> Export PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Assets" value={active.stats.assetsAnalyzed} color="#fff" />
                <Stat label="Critical Issues" value={active.stats.critical} color={COLORS.red} />
                <Stat label="High Risk" value={active.stats.high} color={COLORS.orange} />
                <Stat label="Medium Risk" value={active.stats.medium} color={COLORS.yellow} />
              </div>

              <div className="mb-6">
                <div className="text-xs font-semibold mb-2 text-grayDim">Detected Damage Distribution</div>
                {active.topDefects.length === 0 ? (
                  <p className="text-xs text-grayDim">No detections recorded for this report yet.</p>
                ) : (
                  <>
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-elevated">
                      {active.topDefects.map((d, i) => (
                        <div key={d.name} style={{ width: `${d.pct}%`, background: swatch[i % 4] }} title={`${d.name} ${d.pct}%`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {active.topDefects.map((d, i) => (
                        <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray">
                          <span className="w-2 h-2 rounded-full" style={{ background: swatch[i % 4] }} />
                          {d.name} ({d.pct}%)
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold mb-2 text-grayDim">Prioritized Recommended Actions</div>
                <ul className="space-y-2">
                  {active.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-green" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
