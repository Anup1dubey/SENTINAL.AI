import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authRateLimiter } from "../middleware/rateLimiters.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = Router();

router.post("/register", authRateLimiter, validateRequest(registerSchema), authController.register);
router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.getMe);

export default router;
