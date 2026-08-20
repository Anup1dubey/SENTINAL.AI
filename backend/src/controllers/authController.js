import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendSuccess(res, { statusCode: 201, message: "Account created successfully", data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  sendSuccess(res, { message: "Logged in successfully", data: result });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  sendSuccess(res, { message: "Current user", data: { user } });
});
