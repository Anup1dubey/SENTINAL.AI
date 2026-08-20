import { ApiError } from "../utils/ApiError.js";

export function roleMiddleware(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
