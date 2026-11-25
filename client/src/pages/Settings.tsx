import { useState, type FormEvent } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button, Card, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useTheme, type ThemeChoice } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api, errorMessage, fieldErrors, setAccessToken } from "../lib/api";
import { cn } from "../lib/utils";

const themes: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { choice, setChoice } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setErrors({ confirm: "Passwords don't match" });
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.patch("/auth/password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setAccessToken(data.accessToken); // the server rotated this session, so keep using the new token
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed. Other devices were signed out.");
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <h2 className="text-lg font-bold">Appearance</h2>
        <div role="radiogroup" aria-label="Theme" className="mt-3 grid grid-cols-3 gap-2">
          {themes.map(({ value, label, icon: Icon }) => (
            <button key={value} role="radio" aria-checked={choice === value} onClick={() => setChoice(value)}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-medium", choice === value ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:bg-sunken")}>
              <Icon className="h-5 w-5" /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Account</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">University email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div><dt className="text-muted">Role</dt><dd className="font-medium capitalize">{user?.role}</dd></div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-4" noValidate>
          <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} required />
          <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} hint="At least 8 characters with a letter and a number." required />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} required />
          <Button type="submit" loading={loading}>Change password</Button>
        </form>
      </Card>
    </div>
  );
}
