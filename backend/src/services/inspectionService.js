import fs from "node:fs/promises";
import { Inspection } from "../models/Inspection.js";
import { ApiError } from "../utils/ApiError.js";
import { analyzeImage } from "./ml/mockInferenceService.js";
import * as assetService from "./assetService.js";
import { Asset } from "../models/Asset.js";

async function resolveAsset({ assetId, type, location, coordinatesX, coordinatesY }, userId) {
  if (assetId) {
    const asset = await assetService.findAssetByAssetId(assetId);
    if (!asset) throw ApiError.notFound("Asset not found for the given assetId", "ASSET_NOT_FOUND");
    return asset;
  }

  if (!type || !location || coordinatesX === undefined || coordinatesY === undefined) {
    throw ApiError.badRequest(
      "Provide an existing assetId, or type/location/coordinatesX/coordinatesY to register a new asset",
      "MISSING_ASSET_INFO"
    );
  }

  const generatedAssetId = `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  return Asset.create({
    assetId: generatedAssetId,
    type,
    location,
    coordinates: { x: Number(coordinatesX), y: Number(coordinatesY) },
    createdBy: userId,
  });
}

export async function createInspection({ file, body, userId }) {
  if (!file) {
    throw ApiError.badRequest("An image file is required", "IMAGE_REQUIRED");
  }

  try {
    const asset = await resolveAsset(body, userId);

    const analysis = await analyzeImage();

    const inspection = await Inspection.create({
      asset: asset._id,
      imageUrl: `/uploads/inspections/${file.filename}`,
      uploadedBy: userId,
      status: "analyzed",
      detections: analysis.detections,
      riskScore: analysis.riskScore,
      severity: analysis.severity,
      analyzedAt: new Date(),
    });

    await assetService.recomputeAssetRisk(asset._id);

    return Inspection.findById(inspection._id).populate("asset");
  } catch (err) {
    await fs.unlink(file.path).catch(() => {});
    throw err;
  }
}

export async function listInspections({ asset, status, page = 1, limit = 20 }) {
  const filter = {};
  if (asset) filter.asset = asset;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [inspections, total] = await Promise.all([
    Inspection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("asset"),
    Inspection.countDocuments(filter),
  ]);

  return { inspections, total };
}

export async function getInspection(id) {
  const inspection = await Inspection.findById(id).populate("asset");
  if (!inspection) throw ApiError.notFound("Inspection not found");
  return inspection;
}

export async function deleteInspection(id) {
  const inspection = await Inspection.findByIdAndDelete(id);
  if (!inspection) throw ApiError.notFound("Inspection not found");

  const imagePath = inspection.imageUrl.replace(/^\/uploads\//, "");
  await fs.unlink(`uploads/${imagePath}`).catch(() => {});

  await assetService.recomputeAssetRisk(inspection.asset);
}
