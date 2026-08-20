import mongoose from "mongoose";

const priorityItemSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inspection",
      default: null,
    },
    defect: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "Completed"],
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

priorityItemSchema.index({ score: -1 });
priorityItemSchema.index({ status: 1 });

export const PriorityItem = mongoose.model("PriorityItem", priorityItemSchema);
