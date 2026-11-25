// Usage: npm run seed   (wipes users and recreates demo accounts. Never run against production data.)
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

if (env.isProd) {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

const DOMAIN = env.allowedDomains[0] || "campusconnect.edu";
const PASSWORD = "Password@123";
const email = (name) => `${name}@${DOMAIN}`;

const students = [
  ["Aarav Sharma", "Computer Science", "B.Tech CSE", 5, ["Python", "Machine Learning", "SQL"], ["Data science", "Kaggle"], "Building a crop-disease classifier for my final year project."],
  ["Diya Banerjee", "Computer Science", "B.Tech CSE", 5, ["React", "TypeScript", "Figma"], ["Web development", "UI design"], "Front-end tinkerer. Always up for a pair-programming session."],
  ["Rohan Das", "Computer Science", "B.Tech CSE", 3, ["C++", "Algorithms", "Python"], ["Competitive programming"], "Codeforces regular, weekend chess player."],
  ["Meera Iyer", "Information Technology", "B.Tech IT", 5, ["Java", "Spring Boot", "MongoDB"], ["Backend development", "Cloud"], "Learning to ship APIs that don't fall over."],
  ["Kabir Singh", "Computer Science", "MCA", 2, ["Kotlin", "Android", "Machine Learning"], ["Mobile apps", "Data science"], "Android dev exploring on-device ML."],
  ["Ananya Roy", "Mathematics", "B.Sc Mathematics", 4, ["Statistics", "R", "Python"], ["Data science", "Probability"], "Stats nerd looking for a study group for real analysis."],
  ["Vikram Patel", "Electronics & Communication", "B.Tech ECE", 6, ["Embedded C", "Arduino", "PCB design"], ["IoT", "Robotics"], "Prototyping low-power sensors."],
  ["Sneha Kulkarni", "Business Administration", "BBA", 4, ["Excel", "Marketing", "Public speaking"], ["Startups", "Case competitions"], "Running the campus entrepreneurship cell."],
  ["Arjun Nair", "Mechanical Engineering", "B.Tech ME", 7, ["CAD", "SolidWorks", "MATLAB"], ["Automotive", "3D printing"], "Formula student team, powertrain."],
  ["Ishita Ghosh", "Computer Science", "B.Tech CSE", 6, ["Python", "Deep Learning", "PyTorch"], ["Machine learning", "Research"], "Reading papers on vision transformers."],
  ["Mohit Verma", "Civil Engineering", "B.Tech CE", 4, ["AutoCAD", "Structural analysis"], ["Sustainable design"], "Interested in low-cost housing materials."],
  ["Priya Menon", "Information Technology", "B.Tech IT", 6, ["Cybersecurity", "Linux", "Python"], ["CTFs", "Networking"], "CTF team captain."],
];

await connectDB();
await User.deleteMany({});

await User.create({
  fullName: "Campus Admin", email: email("admin"), password: PASSWORD, role: "admin",
  headline: "CampusConnect administrator", isEmailVerified: true,
});

await User.create([
  { fullName: "Dr. Neha Kapoor", email: email("neha.kapoor"), password: PASSWORD, role: "faculty", department: "Computer Science",
    headline: "Associate Professor · Machine Learning", bio: "Teaching ML and data mining. Office hours Tuesdays and Thursdays.",
    skills: ["Machine Learning", "Statistics"], interests: ["Healthcare AI"], isEmailVerified: true, facultyVerified: true },
  { fullName: "Prof. Rajesh Mukherjee", email: email("rajesh.mukherjee"), password: PASSWORD, role: "faculty", department: "Mathematics",
    headline: "Professor · Applied Mathematics", skills: ["Linear algebra", "Optimization"], isEmailVerified: true, facultyVerified: true },
  { fullName: "Dr. Sana Qureshi", email: email("sana.qureshi"), password: PASSWORD, role: "faculty", department: "Information Technology",
    headline: "Assistant Professor", isEmailVerified: true, facultyVerified: false },
]);

await User.create(
  students.map(([fullName, department, course, semester, skills, interests, bio], i) => ({
    fullName, department, course, semester, skills, interests, bio,
    headline: `${course} · Semester ${semester}`,
    email: email(fullName.toLowerCase().replace(/[^a-z]+/g, ".")),
    studentId: `CC2${String(i + 1).padStart(4, "0")}`,
    password: PASSWORD, role: "student", isEmailVerified: true,
    achievements: i % 3 === 0 ? [{ title: "Dean's list", year: 2025 }] : [],
  }))
);

console.log(`Seeded 1 admin, 3 faculty, ${students.length} students. Password for all: ${PASSWORD}`);
console.log(`Try: admin@${DOMAIN}  |  neha.kapoor@${DOMAIN}  |  aarav.sharma@${DOMAIN}`);
await mongoose.disconnect();
