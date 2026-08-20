import Joi from "joi";

const coordinatesSchema = Joi.object({
  x: Joi.number().min(0).max(100).required(),
  y: Joi.number().min(0).max(100).required(),
});

export const listAssetsSchema = {
  query: Joi.object({
    type: Joi.string().valid("Road", "Bridge", "Flyover", "Building"),
    severity: Joi.string().valid("Critical", "High", "Medium", "Low"),
    minRisk: Joi.number().min(0).max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export const createAssetSchema = {
  body: Joi.object({
    assetId: Joi.string().trim().min(3).max(40).required(),
    type: Joi.string().valid("Road", "Bridge", "Flyover", "Building").required(),
    location: Joi.string().trim().min(2).max(200).required(),
    coordinates: coordinatesSchema.required(),
  }),
};

export const updateAssetSchema = {
  body: Joi.object({
    type: Joi.string().valid("Road", "Bridge", "Flyover", "Building"),
    location: Joi.string().trim().min(2).max(200),
    coordinates: coordinatesSchema,
  }).min(1),
};
