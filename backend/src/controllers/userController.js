import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as userService from "../services/userService.js";

export const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  sendSuccess(res, { message: "Users retrieved", data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    throw ApiError.forbidden();
  }
  const user = await userService.getUser(req.params.id);
  sendSuccess(res, { message: "User retrieved", data: { user } });
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  sendSuccess(res, { message: "User role updated", data: { user } });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, { message: "User deleted", data: {} });
});
