import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, errorCode, errorMessage, fieldErrors } from "../lib/api";
import { homePath } from "../lib/utils";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsVerification, setNeedsVerification] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrors({});
    setNeedsVerification(false);
    try {
      const user = await login(email, password);
      navigate(from ?? homePath(user.role), { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      if (errorCode(err) === "EMAIL_NOT_VERIFIED") setNeedsVerification(true);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      toast.success(data.message);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your university email." footer={<>New here? <AuthLink to="/signup">Create an account</AuthLink></>}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
            {needsVerification && (
              <button type="button" onClick={resend} className="mt-1 block font-medium underline">Resend verification email</button>
            )}
          </div>
        )}
        <Input label="University email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-brand hover:underline">Forgot password?</Link></div>
        <Button type="submit" loading={loading} className="w-full">Log in</Button>
      </form>
    </AuthLayout>
  );
}
