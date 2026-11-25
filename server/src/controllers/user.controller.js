import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteImage, saveImage } from "../services/upload.service.js";
import { DEPARTMENTS, MAX_SEMESTER } from "../constants.js";

export const getMeta = (_req, res) =>
  res.json({ departments: DEPARTMENTS, semesters: Array.from({ length: MAX_SEMESTER }, (_, i) => i + 1) });

// Other people's profiles hide private fields (email, student ID, account flags).
function shapeProfile(user, viewer) {
  const json = user.toJSON();
  const isSelf = viewer.id === user.id;
  if (!isSelf && viewer.role !== "admin") {
    delete json.email;
    delete json.studentId;
    delete json.isEmailVerified;
    delete json.isActive;
  }
  return json;
}

export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Profile not found.");
  const user = await User.findOne({ _id: id, isActive: true });
  if (!user) throw new ApiError(404, "Profile not found.");
  res.json({ user: shapeProfile(user, req.user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  Object.assign(user, req.body); // body is whitelisted by updateProfileSchema
  await user.save();
  res.json({ user });
});

// Factory for avatar / cover uploads
const imageHandler = (field, folder) =>
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Choose an image to upload.");
    const user = await User.findById(req.user.id);
    const previous = user[field];
    user[field] = await saveImage(req.file, folder);
    await user.save();
    await deleteImage(previous);
    res.json({ user });
  });

export const uploadAvatar = imageHandler("avatar", "avatars");
export const uploadCover = imageHandler("cover", "covers");

const intersect = (a, b) => {
  const set = new Set(a.map((s) => s.toLowerCase()));
  return b.filter((s) => set.has(s.toLowerCase()));
};

// Study-partner suggestions: department, semester proximity and shared skills/interests.
// Scored in memory over a bounded candidate set, which is fine at campus scale.
// The full Study Partner Finder module will add filters and connection state.
export const getSuggestions = asyncHandler(async (req, res) => {
  const me = req.user;
  if (me.role !== "student") return res.json({ suggestions: [] });

  const candidates = await User.find({ _id: { $ne: me._id }, role: "student", isActive: true, isEmailVerified: true })
    .select("fullName role department course semester headline skills interests avatar")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const myTopics = [...me.skills, ...me.interests];
  const scored = candidates.map((c) => {
    const shared = [...new Set(intersect(myTopics, [...c.skills, ...c.interests]).map((s) => s.toLowerCase()))];
    let score = 0;
    if (c.department && c.department === me.department) score += 40;
    if (c.semester && me.semester) {
      const gap = Math.abs(c.semester - me.semester);
      score += gap === 0 ? 20 : gap === 1 ? 10 : 0;
    }
    score += Math.min(shared.length * 10, 40);
    return { ...c, matchScore: score, sharedTopics: shared.slice(0, 4) };
  });

  const suggestions = scored
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
  res.json({ suggestions });
});
