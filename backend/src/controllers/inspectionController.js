import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as inspectionService from "../services/inspectionService.js";

export const create = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.createInspection({
    file: req.file,
    body: req.body,
    userId: req.user.id,
  });
  sendSuccess(res, { statusCode: 201, message: "Inspection analyzed successfully", data: { inspection } });
});

export const list = asyncHandler(async (req, res) => {
  const result = await inspectionService.listInspections(req.query);
  sendSuccess(res, { message: "Inspections retrieved", data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspection(req.params.id);
  sendSuccess(res, { message: "Inspection retrieved", data: { inspection } });
});

export const remove = asyncHandler(async (req, res) => {
  await inspectionService.deleteInspection(req.params.id);
  sendSuccess(res, { message: "Inspection deleted", data: {} });
});
