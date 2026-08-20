import { Router } from "express";
import * as inspectionController from "../controllers/inspectionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { uploadInspectionImage } from "../middleware/uploadMiddleware.js";
import { createInspectionSchema, listInspectionsSchema } from "../validators/inspectionValidators.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin", "inspector"),
  uploadInspectionImage,
  validateRequest(createInspectionSchema),
  inspectionController.create
);
router.get("/", validateRequest(listInspectionsSchema), inspectionController.list);
router.get("/:id", inspectionController.getOne);
router.delete("/:id", roleMiddleware("admin"), inspectionController.remove);

export default router;
