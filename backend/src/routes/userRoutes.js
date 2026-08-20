import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { listUsersSchema, updateRoleSchema } from "../validators/userValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", roleMiddleware("admin"), validateRequest(listUsersSchema), userController.list);
router.get("/:id", userController.getOne);
router.patch("/:id/role", roleMiddleware("admin"), validateRequest(updateRoleSchema), userController.updateRole);
router.delete("/:id", roleMiddleware("admin"), userController.remove);

export default router;
