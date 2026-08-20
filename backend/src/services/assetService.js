import fs from "node:fs/promises";
import { Asset } from "../models/Asset.js";
import { Inspection } from "../models/Inspection.js";
import { PriorityItem } from "../models/PriorityItem.js";
import { ApiError } from "../utils/ApiError.js";
import { severityFromScore } from "../utils/severity.js";

export async function listAssets({ type, severity, minRisk, page = 1, limit = 50 }) {
  const filter = {};
  if (type) filter.type = type;
  if (severity) filter.severity = severity;
  if (minRisk) filter.riskScore = { $gte: Number(minRisk) };

  const skip = (page - 1) * limit;
  const [assets, total] = await Promise.all([
    Asset.find(filter).sort({ riskScore: -1 }).skip(skip).limit(limit),
    Asset.countDocuments(filter),
  ]);

  return { assets, total };
}

export async function getAssetWithHistory(id) {
  const asset = await Asset.findById(id);
  if (!asset) throw ApiError.notFound("Asset not found");

  const recentInspections = await Inspection.find({ asset: id }).sort({ createdAt: -1 }).limit(10);

  return { asset, recentInspections };
}

export async function createAsset({ assetId, type, location, coordinates }, createdBy) {
  const existing = await Asset.findOne({ assetId: assetId.toUpperCase() });
  if (existing) {
    throw ApiError.conflict("An asset with this assetId already exists", "ASSET_ID_TAKEN");
  }

  return Asset.create({ assetId, type, location, coordinates, createdBy });
}

export async function updateAsset(id, updates) {
  const asset = await Asset.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!asset) throw ApiError.notFound("Asset not found");
  return asset;
}

export async function deleteAsset(id) {
  const asset = await Asset.findByIdAndDelete(id);
  if (!asset) throw ApiError.notFound("Asset not found");

  const inspections = await Inspection.find({ asset: id }).select("imageUrl");
  await Promise.all(
    inspections.map((inspection) => {
      const relativePath = inspection.imageUrl.replace(/^\/uploads\//, "");
      return fs.unlink(`uploads/${relativePath}`).catch(() => {});
    })
  );

  await Promise.all([
    Inspection.deleteMany({ asset: id }),
    PriorityItem.deleteMany({ asset: id }),
  ]);
}

export async function recomputeAssetRisk(assetId) {
  const latest = await Inspection.findOne({ asset: assetId, status: "analyzed" }).sort({ createdAt: -1 });
  const defectCount = await Inspection.countDocuments({ asset: assetId, status: "analyzed" });

  if (!latest) {
    await Asset.findByIdAndUpdate(assetId, {
      riskScore: 0,
      severity: "Low",
      defectCount: 0,
      lastInspectedAt: null,
    });
    return;
  }

  await Asset.findByIdAndUpdate(assetId, {
    riskScore: latest.riskScore,
    severity: severityFromScore(latest.riskScore),
    defectCount,
    lastInspectedAt: latest.analyzedAt,
  });
}

export async function findAssetByAssetId(assetIdCode) {
  return Asset.findOne({ assetId: assetIdCode.toUpperCase() });
}
