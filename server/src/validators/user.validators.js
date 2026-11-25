import { z } from "zod";
import { DEPARTMENTS, MAX_SEMESTER } from "../constants.js";

const tagList = z
  .array(z.string().trim().min(1).max(30))
  .max(15, "Add up to 15 items")
  .transform((list) => [...new Set(list)]);

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  department: z.string().trim().refine((d) => DEPARTMENTS.includes(d), "Choose a department from the list").optional(),
  course: z.string().trim().max(80).optional(),
  semester: z.coerce.number().int().min(1).max(MAX_SEMESTER).optional(),
  skills: tagList.optional(),
  interests: tagList.optional(),
  achievements: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Add a title").max(100),
        description: z.string().trim().max(300).optional(),
        year: z.coerce.number().int().min(1990).max(2100).optional(),
      })
    )
    .max(10, "Add up to 10 achievements")
    .optional(),
});
