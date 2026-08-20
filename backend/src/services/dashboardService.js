import { Asset } from "../models/Asset.js";
import { Inspection } from "../models/Inspection.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getSummary() {
  const [severityCounts, totalAssets, defectsBreakdown, healthTrend] = await Promise.all([
    Asset.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
    Asset.countDocuments(),
    getDefectsBreakdown(),
    getHealthTrend(),
  ]);

  const countFor = (severity) => severityCounts.find((s) => s._id === severity)?.count || 0;

  const summaryStats = [
    { label: "Critical Issues", value: countFor("Critical"), sub: "Immediate attention" },
    { label: "High Risk Assets", value: countFor("High"), sub: "Action within 14 days" },
    { label: "Medium Risk Assets", value: countFor("Medium"), sub: "Monitor closely" },
    { label: "Assets Monitored", value: totalAssets, sub: "Across region" },
  ];

  const riskDistribution = ["Critical", "High", "Medium", "Low"].map((name) => ({
    name,
    value: countFor(name),
  }));

  return { summaryStats, riskDistribution, defectsBreakdown, healthTrend };
}

async function getDefectsBreakdown() {
  const rows = await Inspection.aggregate([
    { $unwind: "$detections" },
    { $group: { _id: "$detections.name", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: 8 },
  ]);

  return rows.map((r) => ({ name: r._id, value: r.value }));
}

async function getHealthTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await Inspection.aggregate([
    { $match: { status: "analyzed", analyzedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$analyzedAt" }, month: { $month: "$analyzedAt" } },
        avgRisk: { $avg: "$riskScore" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return rows.map((r) => ({
    month: MONTH_NAMES[r._id.month - 1],
    score: Math.round(100 - r.avgRisk),
  }));
}
