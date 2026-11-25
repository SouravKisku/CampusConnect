import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select, TagInput, Textarea } from "../components/ui";
import { useMeta } from "../lib/hooks";
import type { Achievement, User } from "../lib/types";

interface Props {
  user: User;
  saving: boolean;
  errors: Record<string, string>;
  onCancel: () => void;
  onSave: (changes: Partial<User>) => void;
}

export function ProfileEditor({ user, saving, errors, onCancel, onSave }: Props) {
  const { data: meta } = useMeta();
  const isStudent = user.role === "student";
  const [form, setForm] = useState({
    fullName: user.fullName,
    headline: user.headline ?? "",
    bio: user.bio ?? "",
    department: user.department ?? "",
    course: user.course ?? "",
    semester: user.semester ? String(user.semester) : "",
  });
  const [skills, setSkills] = useState(user.skills);
  const [interests, setInterests] = useState(user.interests);
  const [achievements, setAchievements] = useState<Achievement[]>(user.achievements);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const updateAch = (i: number, patch: Partial<Achievement>) =>
    setAchievements((list) => list.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave({
      fullName: form.fullName,
      headline: form.headline,
      bio: form.bio,
      ...(form.department && { department: form.department }),
      ...(isStudent && form.course && { course: form.course }),
      ...(isStudent && form.semester && { semester: Number(form.semester) }),
      skills,
      interests,
      achievements: achievements.filter((a) => a.title.trim()).map(({ title, description, year }) => ({ title, description: description || undefined, year: year || undefined })),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Input label="Full name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} required />
      <Input label="Headline" placeholder="e.g. MCA student · Android and ML" value={form.headline} onChange={set("headline")} error={errors.headline} maxLength={120} />
      <Textarea label="Bio" value={form.bio} onChange={set("bio")} error={errors.bio} maxLength={500} hint={`${form.bio.length}/500`} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Department" value={form.department} onChange={set("department")} error={errors.department}>
          <option value="">Choose department</option>
          {meta?.departments.map((d) => <option key={d}>{d}</option>)}
        </Select>
        {isStudent && (
          <Select label="Semester" value={form.semester} onChange={set("semester")} error={errors.semester}>
            <option value="">Choose</option>
            {meta?.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        )}
      </div>
      {isStudent && <Input label="Course" value={form.course} onChange={set("course")} error={errors.course} />}

      <TagInput label="Skills" value={skills} onChange={setSkills} placeholder="Python, Figma…" error={errors.skills} />
      <TagInput label="Learning interests" value={interests} onChange={setInterests} placeholder="Data science, robotics…" error={errors.interests} />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Academic achievements</legend>
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_6rem_auto]">
              <input aria-label="Achievement title" placeholder="Title" value={a.title} maxLength={100} onChange={(e) => updateAch(i, { title: e.target.value })} className="h-9 rounded-lg border border-line bg-surface px-3 text-sm" />
              <input aria-label="Year" placeholder="Year" inputMode="numeric" value={a.year ?? ""} onChange={(e) => updateAch(i, { year: e.target.value ? Number(e.target.value.replace(/\D/g, "").slice(0, 4)) : undefined })} className="h-9 rounded-lg border border-line bg-surface px-3 text-sm" />
              <button type="button" onClick={() => setAchievements((l) => l.filter((_, idx) => idx !== i))} aria-label="Remove achievement" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              <input aria-label="Description" placeholder="Short description (optional)" value={a.description ?? ""} maxLength={300} onChange={(e) => updateAch(i, { description: e.target.value })} className="h-9 rounded-lg border border-line bg-surface px-3 text-sm sm:col-span-3" />
            </div>
          ))}
          {errors.achievements && <p className="text-sm text-danger">{errors.achievements}</p>}
          {achievements.length < 10 && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setAchievements((l) => [...l, { title: "" }])}><Plus className="h-4 w-4" /> Add achievement</Button>
          )}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" loading={saving}>Save changes</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
