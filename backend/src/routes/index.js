import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import assetRoutes from "./assetRoutes.js";
import inspectionRoutes from "./inspectionRoutes.js";
import priorityQueueRoutes from "./priorityQueueRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.status(200).json({ success: true, message: "OK", data: {} }));

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/assets", assetRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/priority-queue", priorityQueueRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);

export default router;
