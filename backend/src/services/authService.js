import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role === "inspector" ? "inspector" : "viewer",
  });

  return { user: toPublicUser(user), token: signToken(user) };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { user: toPublicUser(user), token: signToken(user) };
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return toPublicUser(user);
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export { toPublicUser };
