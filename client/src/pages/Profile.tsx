import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Camera, GraduationCap, Pencil, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, errorMessage, fieldErrors } from "../lib/api";
import type { User } from "../lib/types";
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { semesterLabel } from "../components/IdCard";
import { ProfileEditor } from "./ProfileEditor";

const MAX_IMAGE = 2 * 1024 * 1024;

function TagList({ items }: { items: string[] }) {
  return <ul className="mt-3 flex flex-wrap gap-2">{items.map((t) => <li key={t}><Badge tone="brand">{t}</Badge></li>)}</ul>;
}

export default function Profile() {
  const { id } = useParams();
  const { user: me, setUser } = useAuth();
  const toast = useToast();
  const isMe = !id || id === me?._id;

  // Your own profile comes from the auth context so edits show instantly everywhere.
  const other = useQuery({
    queryKey: ["user", id],
    enabled: !isMe,
    queryFn: async () => (await api.get<{ user: User }>(`/users/${id}`)).data.user,
  });
  const profile = isMe ? me : other.data;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  async function save(changes: Partial<User>) {
    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.patch<{ user: User }>("/users/me", changes);
      setUser(data.user);
      setEditing(false);
      toast.success("Profile saved.");
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function upload(kind: "avatar" | "cover", file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Choose a JPG, PNG or WebP image.");
    if (file.size > MAX_IMAGE) return toast.error("Images must be under 2 MB.");
    setUploading(kind);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post<{ user: User }>(`/users/me/${kind}`, body);
      setUser(data.user);
      toast.success(kind === "avatar" ? "Profile picture updated." : "Cover image updated.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(null);
    }
  }

  if (!isMe && other.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-44 w-full rounded-2xl" /><Skeleton className="h-8 w-60" /><Skeleton className="h-24 w-full" /></div>;
  }
  if (!profile) {
    return <Card><ErrorState message={other.error ? errorMessage(other.error, "We couldn't find that profile.") : "We couldn't find that profile."} onRetry={() => other.refetch()} /></Card>;
  }

  const academic = [profile.course, semesterLabel(profile.semester)].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="relative h-36 bg-brand sm:h-48" style={profile.cover?.url ? { background: `center / cover url(${profile.cover.url})` } : undefined}>
          {isMe && (
            <>
              <input ref={coverInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => { upload("cover", e.target.files?.[0]); e.target.value = ""; }} />
              <Button variant="secondary" size="sm" loading={uploading === "cover"} onClick={() => coverInput.current?.click()} className="absolute right-3 top-3"><Camera className="h-4 w-4" /> Cover</Button>
            </>
          )}
        </div>
        <div className="px-5 pb-5 sm:px-8">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <div className="relative">
              <Avatar name={profile.fullName} src={profile.avatar?.url} size={96} className="ring-4 ring-surface" />
              {isMe && (
                <>
                  <input ref={avatarInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => { upload("avatar", e.target.files?.[0]); e.target.value = ""; }} />
                  <button onClick={() => avatarInput.current?.click()} disabled={uploading === "avatar"} aria-label="Change profile picture" className="absolute -bottom-1 -right-1 rounded-full border border-line bg-surface p-1.5 shadow hover:bg-sunken disabled:opacity-50"><Camera className="h-4 w-4" /></button>
                </>
              )}
            </div>
            {isMe && !editing && <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit profile</Button>}
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{profile.fullName}</h1>
              {profile.role === "faculty" && (profile.facultyVerified ? <Badge tone="success"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Verified faculty</Badge> : <Badge tone="accent">Faculty · pending verification</Badge>)}
              {profile.role === "admin" && <Badge tone="brand">Administrator</Badge>}
            </div>
            {profile.headline && <p className="mt-1 text-muted">{profile.headline}</p>}
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <GraduationCap className="h-4 w-4" aria-hidden />
              {[profile.department, academic].filter(Boolean).join(" · ") || "Department not set"}
            </p>
          </div>
        </div>
      </Card>

      {editing && isMe ? (
        <Card>
          <h2 className="mb-5 text-lg font-bold">Edit profile</h2>
          <ProfileEditor user={profile} saving={saving} errors={errors} onCancel={() => { setEditing(false); setErrors({}); }} onSave={save} />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold">About</h2>
              {profile.bio ? <p className="mt-2 max-w-prose whitespace-pre-line text-[15px] leading-relaxed">{profile.bio}</p> : <p className="mt-2 text-sm text-muted">{isMe ? "Add a short bio so classmates know who you are." : "No bio yet."}</p>}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">Achievements</h2>
              {profile.achievements.length === 0 ? (
                <EmptyState icon={<Trophy className="h-5 w-5" />} title="No achievements yet">{isMe ? "Add awards, projects or certifications from Edit profile." : "Nothing shared yet."}</EmptyState>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {profile.achievements.map((a, i) => (
                    <li key={a._id ?? i} className="py-3">
                      <p className="font-medium">{a.title}{a.year ? <span className="font-normal text-muted"> · {a.year}</span> : null}</p>
                      {a.description && <p className="mt-0.5 text-sm text-muted">{a.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold">Skills</h2>
              {profile.skills.length ? <TagList items={profile.skills} /> : <p className="mt-2 text-sm text-muted">{isMe ? "No skills listed yet." : "None listed."}</p>}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">Interests</h2>
              {profile.interests.length ? <TagList items={profile.interests} /> : <p className="mt-2 text-sm text-muted">{isMe ? "No interests listed yet." : "None listed."}</p>}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
