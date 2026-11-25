import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { Button, Input } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { api, errorMessage, fieldErrors } from "../lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      setSent((await api.post("/auth/forgot-password", { email })).data.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your university email and we'll send a reset link." footer={<AuthLink to="/login">Back to log in</AuthLink>}>
      {sent ? (
        <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">{sent}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <div role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>}
          <Input label="University email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const token = useSearchParams()[0].get("token") ?? "";
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setErrors({ confirm: "Passwords don't match" });
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password });
      toast.success(data.message);
      navigate("/login", { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset link missing" footer={<AuthLink to="/forgot-password">Request a new link</AuthLink>}>
        <p className="text-sm text-muted">Open the link from your reset email, or request a new one.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" footer={<AuthLink to="/login">Back to log in</AuthLink>}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && !errors.password && <div role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>}
        <Input label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters with a letter and a number." required />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} required />
        <Button type="submit" loading={loading} className="w-full">Update password</Button>
      </form>
    </AuthLayout>
  );
}
