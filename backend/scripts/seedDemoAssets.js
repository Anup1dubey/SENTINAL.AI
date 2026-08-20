import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";
import { Asset } from "../src/models/Asset.js";

const SEED_USER_EMAIL = "seed-system@sentinel.local";

const DEMO_ASSETS = [
  { assetId: "ROAD-0234", type: "Road", location: "Baner Road", coordinates: { x: 30, y: 26 } },
  { assetId: "BRIDGE-0087", type: "Bridge", location: "Mumbai-Pune Highway", coordinates: { x: 74, y: 18 } },
  { assetId: "FLYOVER-0021", type: "Flyover", location: "Shivajinagar", coordinates: { x: 42, y: 72 } },
];

async function ensureSeedUser() {
  let user = await User.findOne({ email: SEED_USER_EMAIL });
  if (user) return user;

  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
  user = await User.create({
    name: "Seed System",
    email: SEED_USER_EMAIL,
    passwordHash,
    role: "admin",
  });
  return user;
}

async function run() {
  await mongoose.connect(env.mongoUri);

  const seedUser = await ensureSeedUser();

  for (const demoAsset of DEMO_ASSETS) {
    const existing = await Asset.findOne({ assetId: demoAsset.assetId });
    if (existing) {
      console.log(`Skipping ${demoAsset.assetId} (already exists)`);
      continue;
    }
    await Asset.create({ ...demoAsset, createdBy: seedUser._id });
    console.log(`Created ${demoAsset.assetId}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
