import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../services/authService.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token", "INVALID_TOKEN"));
  }
}
