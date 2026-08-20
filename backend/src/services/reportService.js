import { Asset } from "../models/Asset.js";
import { Inspection } from "../models/Inspection.js";
import { PriorityItem } from "../models/PriorityItem.js";
import { Report } from "../models/Report.js";
import { ApiError } from "../utils/ApiError.js";

const TYPE_CONFIG = {
  monthly: {
    defaultTitle: "Monthly Infrastructure Health Report",
    filter: {},
    summary: (s) =>
      `Overall network health summary across ${s.assetsAnalyzed} monitored assets, with ${s.critical} critical and ${s.high} high-risk issues requiring attention.`,
  },
  critical: {
    defaultTitle: "Critical Infrastructure Report",
    filter: { $or: [{ severity: "Critical" }, { type: { $in: ["Bridge", "Flyover"] } }] },
    summary: (s) =>
      `This report isolates the ${s.assetsAnalyzed} highest-consequence assets in the network, flagging ${s.critical} that require intervention within the next inspection cycle.`,
  },
  road: {
    defaultTitle: "Road Damage Report",
    filter: { type: "Road" },
    summary: (s) =>
      `Road-surface defects across ${s.assetsAnalyzed} monitored road assets, with ${s.critical} critical and ${s.high} high-risk segments.`,
  },
  maintenance: {
    defaultTitle: "Maintenance Priority Report",
    filter: { severity: { $in: ["Critical", "High"] } },
    summary: (s) =>
      `${s.assetsAnalyzed} assets flagged for active maintenance scheduling this cycle, ranked by composite risk score.`,
  },
  custom: {
    defaultTitle: "Custom Infrastructure Report",
    filter: {},
    summary: (s) => `Custom report covering ${s.assetsAnalyzed} monitored assets.`,
  },
};

export async function generateReport({ type, title }, generatedBy) {
  const config = TYPE_CONFIG[type];
  if (!config) throw ApiError.badRequest("Invalid report type", "INVALID_REPORT_TYPE");

  const assets = await Asset.find(config.filter).select("_id severity");
  const assetIds = assets.map((a) => a._id);

  const stats = {
    assetsAnalyzed: assets.length,
    critical: assets.filter((a) => a.severity === "Critical").length,
    high: assets.filter((a) => a.severity === "High").length,
    medium: assets.filter((a) => a.severity === "Medium").length,
  };

  const topDefects = await getTopDefects(assetIds);
  const actions = await getRecommendedActions(assetIds);

  const report = await Report.create({
    title: title || config.defaultTitle,
    type,
    generatedBy,
    stats,
    summary: config.summary(stats),
    topDefects,
    actions,
    relatedAssets: assetIds,
  });

  return report;
}

async function getTopDefects(assetIds) {
  const rows = await Inspection.aggregate([
    { $match: { asset: { $in: assetIds } } },
    { $unwind: "$detections" },
    { $group: { _id: "$detections.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 4 },
  ]);

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  if (total === 0) return [];

  return rows.map((r) => ({ name: r._id, pct: Math.round((r.count / total) * 100) }));
}

async function getRecommendedActions(assetIds) {
  const items = await PriorityItem.find({ asset: { $in: assetIds }, status: { $ne: "Completed" } })
    .sort({ score: -1 })
    .limit(3)
    .select("action");

  if (items.length === 0) {
    return ["Continue routine monitoring on affected assets."];
  }

  return items.map((i) => i.action);
}

export async function listReports({ type, page = 1, limit = 20 }) {
  const filter = {};
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);

  return { reports, total };
}

export async function getReport(id) {
  const report = await Report.findById(id).populate("relatedAssets", "assetId location type");
  if (!report) throw ApiError.notFound("Report not found");
  return report;
}

export async function deleteReport(id) {
  const report = await Report.findByIdAndDelete(id);
  if (!report) throw ApiError.notFound("Report not found");
}
