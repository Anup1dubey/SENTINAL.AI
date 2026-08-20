import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as dashboardService from "../services/dashboardService.js";

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  sendSuccess(res, { message: "Dashboard summary retrieved", data: summary });
});
