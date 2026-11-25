import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2, MailCheck } from "lucide-react";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { api, errorMessage } from "../lib/api";

export default function VerifyEmail() {
  const token = useSearchParams()[0].get("token");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">(token ? "loading" : "idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return; // the token is single-use, so never send it twice (StrictMode)
    started.current = true;
    api.post("/auth/verify-email", { token })
      .then((res) => { setMessage(res.data.message); setState("ok"); })
      .catch((err) => { setMessage(errorMessage(err)); setState("error"); });
  }, [token]);

  const icon = {
    idle: <MailCheck className="h-6 w-6 text-brand" />,
    loading: <Loader2 className="h-6 w-6 animate-spin text-brand" />,
    ok: <CheckCircle2 className="h-6 w-6 text-success" />,
    error: <CircleAlert className="h-6 w-6 text-danger" />,
  }[state];

  return (
    <AuthLayout title="Email verification" footer={<AuthLink to="/login">Go to log in</AuthLink>}>
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        <div className="rounded-full bg-sunken p-3">{icon}</div>
        <p className="text-sm text-muted">
          {state === "idle" && "Open the verification link we emailed you to activate your account."}
          {state === "loading" && "Verifying your email…"}
          {(state === "ok" || state === "error") && message}
        </p>
        {state === "error" && <p className="text-sm text-muted">Log in to request a new link.</p>}
      </div>
    </AuthLayout>
  );
}
