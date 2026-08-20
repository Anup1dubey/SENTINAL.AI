import { PriorityItem } from "../models/PriorityItem.js";
import { Asset } from "../models/Asset.js";
import { ApiError } from "../utils/ApiError.js";

export async function listQueue({ status, severity, page = 1, limit = 50 }) {
  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PriorityItem.find(filter)
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit)
      .populate("asset")
      .populate("assignedTo", "name email role"),
    PriorityItem.countDocuments(filter),
  ]);

  const ranked = items.map((item, index) => ({ ...item.toObject(), rank: skip + index + 1 }));

  return { items: ranked, total };
}

export async function addQueueItem({ assetId, inspectionId, defect, severity, score, action }) {
  const asset = await Asset.findById(assetId);
  if (!asset) throw ApiError.notFound("Asset not found");

  return PriorityItem.create({
    asset: assetId,
    inspection: inspectionId || null,
    defect,
    severity,
    score,
    action,
  });
}

export async function updateQueueItem(id, updates) {
  const item = await PriorityItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) throw ApiError.notFound("Priority queue item not found");
  return item;
}

export async function deleteQueueItem(id) {
  const item = await PriorityItem.findByIdAndDelete(id);
  if (!item) throw ApiError.notFound("Priority queue item not found");
}
