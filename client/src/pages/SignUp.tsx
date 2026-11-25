import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Camera, MailCheck } from "lucide-react";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { Avatar, Button, Input, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { errorMessage, fieldErrors } from "../lib/api";
import { useMeta } from "../lib/hooks";
import { cn } from "../lib/utils";

type RoleChoice = "student" | "faculty";
const MAX_AVATAR = 2 * 1024 * 1024;

export default function SignUp() {
  const { register } = useAuth();
  const toast = useToast();
  const { data: meta } = useMeta();
  const fileRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState<RoleChoice>("student");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", department: "", course: "", semester: "", studentId: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : undefined), [avatar]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function pickFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Choose a JPG, PNG or WebP image.");
    if (file.size > MAX_AVATAR) return toast.error("Profile pictures must be under 2 MB.");
    setAvatar(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.append("role", role);
      body.append("fullName", form.fullName);
      body.append("email", form.email);
      body.append("password", form.password);
      body.append("department", form.department);
      if (role === "student") {
        body.append("course", form.course);
        body.append("semester", form.semester);
        if (form.studentId) body.append("studentId", form.studentId);
      }
      if (avatar) body.append("avatar", avatar);
      setDoneMessage(await register(body));
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (doneMessage) {
    return (
      <AuthLayout title="Check your inbox" footer={<AuthLink to="/login">Back to log in</AuthLink>}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-brand-soft p-3 text-brand"><MailCheck className="h-6 w-6" /></div>
          <p className="text-sm text-muted">{doneMessage}</p>
          {role === "faculty" && <p className="text-sm text-muted">Faculty accounts are reviewed by an administrator before they get the faculty badge.</p>}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Use your university email so we can confirm you belong here." footer={<>Already have an account? <AuthLink to="/login">Log in</AuthLink></>}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && !Object.keys(errors).length && <div role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{formError}</div>}

        <div role="radiogroup" aria-label="I am a" className="grid grid-cols-2 gap-1 rounded-lg bg-sunken p-1">
          {(["student", "faculty"] as const).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={role === r} onClick={() => setRole(r)}
              className={cn("rounded-md py-1.5 text-sm font-medium capitalize", role === r ? "bg-surface shadow-sm" : "text-muted")}>
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Choose profile picture" className="group relative rounded-full">
            <Avatar name={form.fullName || "?"} src={preview} size={64} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="h-5 w-5" /></span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
          <p className="text-sm text-muted">Profile picture (optional). JPG, PNG or WebP, up to 2 MB.</p>
        </div>

        <Input label="Full name" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} required />
        <Input label="University email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} required />
        <Input label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} hint="At least 8 characters with a letter and a number." required />

        <Select label="Department" value={form.department} onChange={set("department")} error={errors.department} required>
          <option value="">Choose department</option>
          {meta?.departments.map((d) => <option key={d}>{d}</option>)}
        </Select>

        {role === "student" && (
          <>
            <Input label="Course" placeholder="e.g. B.Tech CSE" value={form.course} onChange={set("course")} error={errors.course} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Semester" value={form.semester} onChange={set("semester")} error={errors.semester} required>
                <option value="">Choose</option>
                {meta?.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input label="Student ID" value={form.studentId} onChange={set("studentId")} error={errors.studentId} hint="Optional" />
            </div>
          </>
        )}

        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>
    </AuthLayout>
  );
}
