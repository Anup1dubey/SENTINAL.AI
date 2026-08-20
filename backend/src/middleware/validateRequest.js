import { ApiError } from "../utils/ApiError.js";

export function validateRequest(schema) {
  return function validate(req, res, next) {
    const target = schema.body ? "body" : schema.query ? "query" : "params";
    const activeSchema = schema.body || schema.query || schema.params;

    const { error, value } = activeSchema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(ApiError.validation(message));
    }

    req[target] = value;
    next();
  };
}
