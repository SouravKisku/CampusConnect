import { z } from "zod";
import { DEPARTMENTS, MAX_SEMESTER } from "../constants.js";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(120);

export const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

const department = z.string().trim().refine((d) => DEPARTMENTS.includes(d), "Choose a department from the list");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email,
    password: passwordRule,
    role: z.enum(["student", "faculty"]).default("student"),
    department,
    course: z.string().trim().max(80).optional(),
    semester: z.coerce.number().int().min(1).max(MAX_SEMESTER).optional(),
    studentId: z.string().trim().max(30).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role === "student") {
      if (!d.course) ctx.addIssue({ code: "custom", path: ["course"], message: "Enter your course" });
      if (!d.semester) ctx.addIssue({ code: "custom", path: ["semester"], message: "Choose your semester" });
    }
  });

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password").max(72) });
export const emailOnlySchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().min(20).max(200) });
export const resetPasswordSchema = z.object({ token: z.string().min(20).max(200), password: passwordRule });
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(72),
  newPassword: passwordRule,
});
