import Joi from "joi";

export const listUsersSchema = {
  query: Joi.object({
    role: Joi.string().valid("admin", "inspector", "viewer"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const updateRoleSchema = {
  body: Joi.object({
    role: Joi.string().valid("admin", "inspector", "viewer").required(),
  }),
};
