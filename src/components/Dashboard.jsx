import React, { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { SEVERITY_STYLE } from "../data";
import * as assetsApi from "../api/assetsApi";
import * as dashboardApi from "../api/dashboardApi";
import * as priorityQueueApi from "../api/priorityQueueApi";
import { ApiError } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import SignalBars from "./SignalBars";

function timeAgo(dateStr) {
  if (!dateStr) return "Never inspected";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function mapAsset(a) {
  return {
    id: a.assetId,
    _id: a._id,
    type: a.type,
    location: a.location,
    risk: a.riskScore,
    severity: a.severity,
    defects: a.defectCount,
    last: timeAgo(a.lastInspectedAt),
    x: a.coordinates?.x ?? 50,
    y: a.coordinates?.y ?? 50,
  };
}

function Badge({ severity }) {
  const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.Low;
  return (
    <span style={{ color: s.fg, background: s.bg, border: `1px solid ${s.fg}33` }} className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
      {severity}
    </span>
  );
}

function Heatmap({ assets, onSelect }) {
  const gridLines = [];
  for (let i = 1; i < 6; i++) {
    gridLines.push(<line key={`v${i}`} x1={`${i * 16.6}%`} y1="0" x2={`${i * 16.6}%`} y2="100%" stroke="rgba(29,185,84,0.1)" strokeWidth="1" />);
    gridLines.push(<line key={`h${i}`} x1="0" y1={`${i * 16.6}%`} x2="100%" y2={`${i * 16.6}%`} stroke="rgba(29,185,84,0.1)" strokeWidth="1" />);
  }
  return (
    <div className="relative w-full h-[320px] md:h-[380px] rounded-xl overflow-hidden" style={{ background: "radial-gradient(circle at 30% 20%, #0f1b12 0%, #0a0a0a 70%)" }}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {gridLines}
        {assets.map((a) => {
          const s = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.Low;
          return <circle key={a._id} cx={`${a.x}%`} cy={`${a.y}%`} r="15%" fill={s.fg} opacity={0.16} />;
        })}
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgba(29,185,84,0.35)" strokeWidth="2" />
        <line x1="55%" y1="0" x2="55%" y2="100%" stroke="rgba(29,185,84,0.35)" strokeWidth="2" />
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(29,185,84,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(29,185,84,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      {assets.map((a) => {
        const s = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.Low;
        return (
          <button key={a._id} onClick={() => onSelect(a)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${a.y}%`, left: `${a.x}%` }}>
            <span className="block w-3.5 h-3.5 rounded-full" style={{ background: s.fg, boxShadow: `0 0 0 4px ${s.fg}22` }} />
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: s.fg, opacity: 0.4 }} />
          </button>
        );
      })}
      {assets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-grayDim">
          No assets yet — run an inspection to populate the map
        </div>
      )}
    </div>
  );
}

function AssetModal({ asset, onClose }) {
  if (!asset) return null;
  const s = SEVERITY_STYLE[asset.severity] || SEVERITY_STYLE.Low;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-elevated p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="font-bold text-white text-base">{asset.id}</div>
            <div className="text-xs text-grayDim flex items-center gap-1 mt-0.5"><MapPin size={11} /> {asset.location}</div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <SignalBars mode="value" values={[asset.risk, asset.risk * 0.6, asset.risk * 0.3]} colors={[s.fg, s.fg, s.fg]} size="lg" />
          <div>
            <div className="text-2xl font-extrabold text-white">{asset.risk} <span className="text-xs font-normal text-grayDim">/ 100</span></div>
            <div className="text-[11px] text-grayDim">Risk Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-xs">
          <span className="text-grayDim">Type</span>
          <span className="text-right font-semibold text-white">{asset.type}</span>
          <span className="text-grayDim">Severity</span>
          <span className="text-right"><Badge severity={asset.severity} /></span>
          <span className="text-grayDim">Defects</span>
          <span className="text-right font-semibold text-white">{asset.defects}</span>
          <span className="text-grayDim">Last Inspection</span>
          <span className="text-right font-semibold text-white">{asset.last}</span>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-full text-xs font-bold bg-green text-black">
          Close
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [priorityItems, setPriorityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [assetsRes, summaryRes, queueRes] = await Promise.all([
          assetsApi.list({ limit: 100 }),
          dashboardApi.getSummary(),
          priorityQueueApi.list({ limit: 50 }),
        ]);
        if (cancelled) return;
        setAssets(assetsRes.assets.map(mapAsset));
        setSummary(summaryRes);
        setPriorityItems(queueRes.items);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 md:px-8 py-24 text-center text-gray text-sm">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-5 md:px-8 py-24 text-center text-red text-sm">{error}</div>;
  }

  const totalFlagged = summary.riskDistribution.reduce((sum, d) => sum + d.value, 0);
  const trendDelta =
    summary.healthTrend.length >= 2
      ? summary.healthTrend[summary.healthTrend.length - 1].score - summary.healthTrend[0].score
      : null;

  return (
    <section id="dashboard" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-widest text-green uppercase">Municipal Dashboard</span>
          <h2 className="text-white font-extrabold text-3xl md:text-4xl tracking-tight mt-3">Infrastructure Overview</h2>
          <p className="text-gray text-sm md:text-base mt-4">Monitor infrastructure health, identify risks and prioritize maintenance.</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-elevated text-gray border border-line">
          <MapPin size={12} /> Pune Municipal Region
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summary.summaryStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-card p-5">
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs font-semibold text-gray mt-1">{s.label}</div>
            <div className="text-[11px] text-grayDim mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Spatial Asset Risk Heatmap</h3>
            <p className="text-xs text-grayDim mt-0.5">Tap a marker for asset details</p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-elevated text-gray">{assets.length} assets plotted</span>
        </div>
        <Heatmap assets={assets} onSelect={setSelectedAsset} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-white font-bold text-sm mb-3">Risk Distribution</h3>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {summary.riskDistribution.map((d, i) => (
                    <Cell key={i} fill={SEVERITY_STYLE[d.name]?.fg} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-white">{totalFlagged}</span>
              <span className="text-[10px] text-grayDim">total flagged</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-white font-bold text-sm mb-3">Detected Defects</h3>
          <div className="h-52">
            {summary.defectsBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-grayDim">No defects recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.defectsBreakdown} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#727272", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="value" fill="#1DB954" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-white font-bold text-sm mb-3">Health Trend</h3>
          <div className="h-52">
            {summary.healthTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-grayDim">Not enough data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.healthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#727272", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }} />
                  <Line type="monotone" dataKey="score" stroke="#1DB954" strokeWidth={2.5} dot={{ r: 3, fill: "#1ED760" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {trendDelta !== null && (
            <div className={`text-xs font-semibold mt-1 ${trendDelta < 0 ? "text-red" : "text-green"}`}>
              {trendDelta < 0 ? "▼" : "▲"} {Math.abs(trendDelta)} pt change over the period
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card p-5">
        <h3 className="text-white font-bold text-sm mb-1">Maintenance Priority Queue</h3>
        <p className="text-xs text-grayDim mb-4">Ranked by automated damage coefficients</p>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-grayDim">
                <th className="py-2 pr-4 font-semibold">#</th>
                <th className="py-2 pr-4 font-semibold">Asset</th>
                <th className="py-2 pr-4 font-semibold">Location</th>
                <th className="py-2 pr-4 font-semibold">Defect</th>
                <th className="py-2 pr-4 font-semibold">Severity</th>
                <th className="py-2 pr-4 font-semibold">Score</th>
                <th className="py-2 pr-4 font-semibold">Action</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {priorityItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-grayDim">
                    Nothing in the priority queue yet
                  </td>
                </tr>
              )}
              {priorityItems.map((r) => (
                <tr
                  key={r._id}
                  className="border-t border-line cursor-pointer hover:bg-cardHover transition-colors"
                  onClick={() => r.asset && setSelectedAsset(mapAsset(r.asset))}
                >
                  <td className="py-3 pr-4 font-bold text-white">{r.rank}</td>
                  <td className="py-3 pr-4 font-semibold text-greenBright">{r.asset?.assetId}</td>
                  <td className="py-3 pr-4 text-gray">{r.asset?.location}</td>
                  <td className="py-3 pr-4 text-gray">{r.defect}</td>
                  <td className="py-3 pr-4"><Badge severity={r.severity} /></td>
                  <td className="py-3 pr-4 font-bold text-white">{r.score}</td>
                  <td className="py-3 pr-4 text-gray">{r.action}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-elevated" style={{ color: r.status === "Completed" ? "#1DB954" : r.status === "Assigned" ? "#F5C94D" : "#B3B3B3" }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </section>
  );
}
