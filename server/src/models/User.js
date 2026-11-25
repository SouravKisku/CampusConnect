import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLES, MAX_SEMESTER } from "../constants.js";

const imageSchema = new mongoose.Schema({ url: String, publicId: String }, { _id: false });

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 300 },
  year: { type: Number, min: 1990, max: 2100 },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "student", index: true },

    // Academic info
    department: { type: String, trim: true, index: true },
    course: { type: String, trim: true, maxlength: 80 },
    semester: { type: Number, min: 1, max: MAX_SEMESTER },
    studentId: { type: String, trim: true, maxlength: 30 },

    // Profile
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 500 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    achievements: { type: [achievementSchema], default: [] },
    avatar: imageSchema,
    cover: imageSchema,

    // Account state
    isEmailVerified: { type: Boolean, default: false },
    facultyVerified: { type: Boolean, default: false }, // set by an admin in the admin module
    isActive: { type: Boolean, default: true },
    reputation: { type: Number, default: 0 }, // used by the discussion forum module

    // Secrets (never returned by the API). Only SHA-256 hashes of tokens are stored.
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: {
      type: [{ hash: String, expiresAt: Date, _id: false }],
      select: false,
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ fullName: "text", skills: "text", interests: "text" });
userSchema.index({ department: 1, semester: 1 });
// Student IDs are optional, so uniqueness only applies when one is present.
userSchema.index({ studentId: 1 }, { unique: true, partialFilterExpression: { studentId: { $type: "string" } } });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.emailVerifyTokenHash;
    delete ret.emailVerifyExpires;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
