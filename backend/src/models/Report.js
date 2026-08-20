import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["monthly", "critical", "road", "maintenance", "custom"],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stats: {
      assetsAnalyzed: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
    },
    summary: {
      type: String,
      required: true,
    },
    topDefects: [
      {
        name: String,
        pct: Number,
        _id: false,
      },
    ],
    actions: [String],
    relatedAssets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
