import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", dashboardController.getSummary);

export default router;
