import mongoose from "mongoose";

const detectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 100, required: true },
    boundingBox: {
      top: Number,
      left: Number,
      width: Number,
      height: Number,
    },
    extra: [[String]],
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "analyzed", "failed"],
      default: "pending",
    },
    detections: [detectionSchema],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Low",
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

inspectionSchema.index({ asset: 1, createdAt: -1 });

export const Inspection = mongoose.model("Inspection", inspectionSchema);
