import Joi from "joi";

export const listReportsSchema = {
  query: Joi.object({
    type: Joi.string().valid("monthly", "critical", "road", "maintenance", "custom"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const generateReportSchema = {
  body: Joi.object({
    type: Joi.string().valid("monthly", "critical", "road", "maintenance", "custom").required(),
    title: Joi.string().trim().min(2).max(200),
  }),
};
