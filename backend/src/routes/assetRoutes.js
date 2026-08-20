import { Router } from "express";
import * as assetController from "../controllers/assetController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { listAssetsSchema, createAssetSchema, updateAssetSchema } from "../validators/assetValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateRequest(listAssetsSchema), assetController.list);
router.get("/:id", assetController.getOne);
router.post("/", roleMiddleware("admin", "inspector"), validateRequest(createAssetSchema), assetController.create);
router.patch("/:id", roleMiddleware("admin"), validateRequest(updateAssetSchema), assetController.update);
router.delete("/:id", roleMiddleware("admin"), assetController.remove);

export default router;
