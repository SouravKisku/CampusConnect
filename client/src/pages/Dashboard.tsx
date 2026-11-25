import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Circle, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { Completeness, Suggestion } from "../lib/types";
import { Avatar, Badge, Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { IdCard, semesterLabel } from "../components/IdCard";

function CompletenessCard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<{ completeness: Completeness }>("/dashboard")).data.completeness,
  });
  if (isLoading) return <Card><Skeleton className="h-5 w-40" /><Skeleton className="mt-4 h-2 w-full" /><Skeleton className="mt-4 h-4 w-3/4" /><Skeleton className="mt-2 h-4 w-2/3" /></Card>;
  if (isError || !data) return <Card><ErrorState message="We couldn't load your profile progress." onRetry={() => refetch()} /></Card>;

  const todo = data.items.filter((i) => !i.done);
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Profile strength</h2>
        <span className="font-display text-2xl font-bold text-brand">{data.percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={data.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${data.percent}%` }} />
      </div>
      {todo.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Your profile is complete. Classmates will find you easily.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.items.map((i) => (
            <li key={i.key} className="flex items-center gap-2 text-sm">
              {i.done ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted" />}
              <span className={i.done ? "text-muted line-through" : ""}>{i.label}</span>
            </li>
          ))}
        </ul>
      )}
      {todo.length > 0 && <Link to="/profile" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">Finish your profile</Link>}
    </Card>
  );
}

function SuggestedPartners() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => (await api.get<{ suggestions: Suggestion[] }>("/users/suggestions")).data.suggestions,
  });

  return (
    <Card>
      <h2 className="text-lg font-bold">Study partners for you</h2>
      <p className="mt-0.5 text-sm text-muted">Matched on department, semester and shared interests.</p>
      <div className="mt-3">
        {isLoading && [0, 1, 2].map((i) => <div key={i} className="flex items-center gap-3 py-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>)}
        {isError && <ErrorState message="We couldn't load suggestions." onRetry={() => refetch()} />}
        {data && data.length === 0 && (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No matches yet">Add your skills and interests to your profile and classmates with overlap will show up here.</EmptyState>
        )}
        <ul className="divide-y divide-line">
          {data?.map((s) => (
            <li key={s._id}>
              <Link to={`/profile/${s._id}`} className="flex items-center gap-3 rounded-lg py-3 hover:opacity-80">
                <Avatar name={s.fullName} src={s.avatar?.url} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.fullName}</p>
                  <p className="truncate text-sm text-muted">{[s.department, semesterLabel(s.semester)].filter(Boolean).join(" · ")}</p>
                  {s.sharedTopics.length > 0 && <p className="mt-0.5 truncate text-xs text-muted">Shared: {s.sharedTopics.join(", ")}</p>}
                </div>
                <Badge tone="brand">{Math.min(s.matchScore, 100)}% match</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  const first = user.fullName.split(" ")[0];
  const isFaculty = user.role === "faculty";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hi, {first}.</h1>
          <p className="mt-1 text-muted">{isFaculty ? "Faculty dashboard" : "Student dashboard"}{user.department ? ` · ${user.department}` : ""}</p>
        </div>
      </div>

      {isFaculty && !user.facultyVerified && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-accent/50 bg-accent/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Your faculty account is waiting for administrator verification. You can use your profile now; announcements and groups unlock once you're verified.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {!isFaculty ? <SuggestedPartners /> : (
            <Card>
              <h2 className="text-lg font-bold">Your department</h2>
              <p className="mt-1 text-sm text-muted">Student discovery for faculty arrives with the study groups module. Complete your profile so students can find you.</p>
            </Card>
          )}
          <CompletenessCard />
        </div>
        <div className="order-first flex justify-center lg:order-none lg:justify-start">
          <IdCard
            name={user.fullName}
            line1={user.department ?? "CampusConnect"}
            line2={isFaculty ? "Faculty" : [user.course, semesterLabel(user.semester)].filter(Boolean).join(" · ")}
            tags={user.skills}
            avatar={user.avatar?.url}
          />
        </div>
      </div>
    </div>
  );
}
