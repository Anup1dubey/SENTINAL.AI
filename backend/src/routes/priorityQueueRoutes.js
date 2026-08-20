import { Router } from "express";
import * as priorityQueueController from "../controllers/priorityQueueController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  listQueueSchema,
  createQueueItemSchema,
  updateQueueItemSchema,
} from "../validators/priorityQueueValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateRequest(listQueueSchema), priorityQueueController.list);
router.post(
  "/",
  roleMiddleware("admin", "inspector"),
  validateRequest(createQueueItemSchema),
  priorityQueueController.create
);
router.patch("/:id", roleMiddleware("admin"), validateRequest(updateQueueItemSchema), priorityQueueController.update);
router.delete("/:id", roleMiddleware("admin"), priorityQueueController.remove);

export default router;
