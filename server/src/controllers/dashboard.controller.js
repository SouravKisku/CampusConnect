import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function completeness(user) {
  const items = [
    { key: "avatar", label: "Add a profile picture", done: Boolean(user.avatar?.url) },
    { key: "cover", label: "Add a cover image", done: Boolean(user.cover?.url) },
    { key: "headline", label: "Write a headline", done: Boolean(user.headline) },
    { key: "bio", label: "Tell people about yourself", done: Boolean(user.bio) },
    { key: "skills", label: "List at least 3 skills", done: user.skills.length >= 3 },
    { key: "interests", label: "Add your learning interests", done: user.interests.length >= 1 },
    { key: "achievements", label: "Share an achievement", done: user.achievements.length >= 1 },
  ];
  const done = items.filter((i) => i.done).length;
  return { percent: Math.round((done / items.length) * 100), items };
}

export const getDashboard = asyncHandler(async (req, res) => {
  res.json({ completeness: completeness(req.user) });
});

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const [byRole, verified, pendingFaculty, recent] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ role: "faculty", facultyVerified: false }),
    User.find().sort({ createdAt: -1 }).limit(8).select("fullName email role department createdAt avatar isEmailVerified facultyVerified"),
  ]);
  const count = (role) => byRole.find((r) => r._id === role)?.count ?? 0;
  res.json({
    stats: {
      totalUsers: byRole.reduce((n, r) => n + r.count, 0),
      students: count("student"),
      faculty: count("faculty"),
      verifiedAccounts: verified,
      pendingFaculty,
    },
    recentRegistrations: recent,
  });
});
