export type Role = "student" | "faculty" | "admin";

export interface Achievement {
  _id?: string;
  title: string;
  description?: string;
  year?: number;
}

export interface UserImage {
  url: string;
  publicId?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  role: Role;
  department?: string;
  course?: string;
  semester?: number;
  studentId?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  achievements: Achievement[];
  avatar?: UserImage;
  cover?: UserImage;
  isEmailVerified?: boolean;
  facultyVerified?: boolean;
  createdAt: string;
}

export interface Suggestion {
  _id: string;
  fullName: string;
  department?: string;
  course?: string;
  semester?: number;
  headline?: string;
  avatar?: UserImage;
  matchScore: number;
  sharedTopics: string[];
}

export interface Completeness {
  percent: number;
  items: { key: string; label: string; done: boolean }[];
}

export interface AdminDashboardData {
  stats: { totalUsers: number; students: number; faculty: number; verifiedAccounts: number; pendingFaculty: number };
  recentRegistrations: Pick<User, "_id" | "fullName" | "email" | "role" | "department" | "createdAt" | "avatar" | "isEmailVerified" | "facultyVerified">[];
}

export interface Meta {
  departments: string[];
  semesters: number[];
}
