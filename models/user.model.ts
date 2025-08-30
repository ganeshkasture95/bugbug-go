// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["Researcher", "Company", "Admin"], required: true },
  twoFactorEnabled: { type: Boolean, default: false },
  xp: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  leaderboardRank: Number,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
