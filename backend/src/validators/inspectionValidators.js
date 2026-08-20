import Joi from "joi";

export const createInspectionSchema = {
  body: Joi.object({
    assetId: Joi.string().trim().min(3).max(40),
    type: Joi.string().valid("Road", "Bridge", "Flyover", "Building"),
    location: Joi.string().trim().min(2).max(200),
    coordinatesX: Joi.number().min(0).max(100),
    coordinatesY: Joi.number().min(0).max(100),
  }),
};

export const listInspectionsSchema = {
  query: Joi.object({
    asset: Joi.string().hex().length(24),
    status: Joi.string().valid("pending", "analyzed", "failed"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
