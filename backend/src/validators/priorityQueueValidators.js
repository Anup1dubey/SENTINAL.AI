import Joi from "joi";

export const listQueueSchema = {
  query: Joi.object({
    status: Joi.string().valid("Pending", "Assigned", "Completed"),
    severity: Joi.string().valid("Critical", "High", "Medium", "Low"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export const createQueueItemSchema = {
  body: Joi.object({
    assetId: Joi.string().hex().length(24).required(),
    inspectionId: Joi.string().hex().length(24),
    defect: Joi.string().trim().min(2).max(200).required(),
    severity: Joi.string().valid("Critical", "High", "Medium", "Low").required(),
    score: Joi.number().min(0).max(100).required(),
    action: Joi.string().trim().min(2).max(300).required(),
  }),
};

export const updateQueueItemSchema = {
  body: Joi.object({
    status: Joi.string().valid("Pending", "Assigned", "Completed"),
    assignedTo: Joi.string().hex().length(24).allow(null),
    action: Joi.string().trim().min(2).max(300),
  }).min(1),
};
