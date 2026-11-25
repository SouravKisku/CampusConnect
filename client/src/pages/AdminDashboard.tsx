import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, GraduationCap, ShieldAlert, UserCheck, Users } from "lucide-react";
import { api } from "../lib/api";
import type { AdminDashboardData } from "../lib/types";
import { Avatar, Badge, Card, ErrorState, Skeleton } from "../components/ui";
import { formatDate } from "../lib/utils";

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await api.get<AdminDashboardData>("/dashboard/admin")).data,
  });

  const tiles = data && [
    { label: "Registered users", value: data.stats.totalUsers, icon: Users },
    { label: "Students", value: data.stats.students, icon: GraduationCap },
    { label: "Faculty", value: data.stats.faculty, icon: BadgeCheck },
    { label: "Verified emails", value: data.stats.verifiedAccounts, icon: UserCheck },
    { label: "Faculty awaiting review", value: data.stats.pendingFaculty, icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-muted">Posts, resources and reports will appear here as those modules go live.</p>
      </div>

      {isError && <Card><ErrorState message="We couldn't load platform stats." onRetry={() => refetch()} /></Card>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {isLoading && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        {tiles?.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <Icon className="h-5 w-5 text-brand" aria-hidden />
            <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-bold">Recent registrations</h2>
        <div className="mt-3 overflow-x-auto">
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-muted">
                <tr><th className="py-2 font-medium">User</th><th className="font-medium">Role</th><th className="font-medium">Department</th><th className="font-medium">Joined</th><th className="font-medium">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.recentRegistrations.map((u) => (
                  <tr key={u._id}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} src={u.avatar?.url} size={32} />
                        <div className="min-w-0"><p className="truncate font-medium">{u.fullName}</p><p className="truncate text-xs text-muted">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="capitalize">{u.role}</td>
                    <td>{u.department ?? "—"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {!u.isEmailVerified ? <Badge>Unverified</Badge> : u.role === "faculty" && !u.facultyVerified ? <Badge tone="accent">Needs review</Badge> : <Badge tone="success">Active</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
