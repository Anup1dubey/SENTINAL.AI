import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { listReportsSchema, generateReportSchema } from "../validators/reportValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateRequest(listReportsSchema), reportController.list);
router.get("/:id", reportController.getOne);
router.post("/", roleMiddleware("admin", "inspector"), validateRequest(generateReportSchema), reportController.create);
router.delete("/:id", roleMiddleware("admin"), reportController.remove);

export default router;
