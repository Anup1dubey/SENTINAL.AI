import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as priorityQueueService from "../services/priorityQueueService.js";

export const list = asyncHandler(async (req, res) => {
  const result = await priorityQueueService.listQueue(req.query);
  sendSuccess(res, { message: "Priority queue retrieved", data: result });
});

export const create = asyncHandler(async (req, res) => {
  const item = await priorityQueueService.addQueueItem(req.body);
  sendSuccess(res, { statusCode: 201, message: "Added to priority queue", data: { item } });
});

export const update = asyncHandler(async (req, res) => {
  const item = await priorityQueueService.updateQueueItem(req.params.id, req.body);
  sendSuccess(res, { message: "Priority queue item updated", data: { item } });
});

export const remove = asyncHandler(async (req, res) => {
  await priorityQueueService.deleteQueueItem(req.params.id);
  sendSuccess(res, { message: "Priority queue item deleted", data: {} });
});
