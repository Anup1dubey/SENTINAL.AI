import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["Road", "Bridge", "Flyover", "Building"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    coordinates: {
      x: { type: Number, min: 0, max: 100, required: true },
      y: { type: Number, min: 0, max: 100, required: true },
    },
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
    defectCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastInspectedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

assetSchema.index({ severity: 1 });
assetSchema.index({ type: 1 });

export const Asset = mongoose.model("Asset", assetSchema);
