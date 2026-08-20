import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { toPublicUser } from "./authService.js";

export async function listUsers({ role, page = 1, limit = 20 }) {
  const filter = {};
  if (role) filter.role = role;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users: users.map(toPublicUser), total, page: Number(page) };
}

export async function getUser(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}

export async function updateUserRole(id, role) {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}

export async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound("User not found");
}
