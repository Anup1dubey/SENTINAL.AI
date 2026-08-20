import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as assetService from "../services/assetService.js";

export const list = asyncHandler(async (req, res) => {
  const result = await assetService.listAssets(req.query);
  sendSuccess(res, { message: "Assets retrieved", data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const result = await assetService.getAssetWithHistory(req.params.id);
  sendSuccess(res, { message: "Asset retrieved", data: result });
});

export const create = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.user.id);
  sendSuccess(res, { statusCode: 201, message: "Asset created", data: { asset } });
});

export const update = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body);
  sendSuccess(res, { message: "Asset updated", data: { asset } });
});

export const remove = asyncHandler(async (req, res) => {
  await assetService.deleteAsset(req.params.id);
  sendSuccess(res, { message: "Asset deleted", data: {} });
});
