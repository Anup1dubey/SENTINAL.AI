import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as reportService from "../services/reportService.js";

export const list = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.query);
  sendSuccess(res, { message: "Reports retrieved", data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.params.id);
  sendSuccess(res, { message: "Report retrieved", data: { report } });
});

export const create = asyncHandler(async (req, res) => {
  const report = await reportService.generateReport(req.body, req.user.id);
  sendSuccess(res, { statusCode: 201, message: "Report generated", data: { report } });
});

export const remove = asyncHandler(async (req, res) => {
  await reportService.deleteReport(req.params.id);
  sendSuccess(res, { message: "Report deleted", data: {} });
});
