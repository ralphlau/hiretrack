"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, ArrowLeft, Users, Briefcase, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer, useToast } from "@/hooks/useToast";
import type { Role } from "@/types";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  _count: { applications: number };
}

interface PlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalApplications: number;
  stageCounts: Record<string, number>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast, dismissToast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) return;
      setStats(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setUsersError(false);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load users");
      setUsers(data);
    } catch (error) {
      console.error(error);
      setUsersError(true);
      addToast({ title: "Unable to load users", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: AdminUser) => {
    const nextRole: Role = user.role === "admin" ? "user" : "admin";
    setPendingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to update role");

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
      addToast({ title: `${user.email} is now ${nextRole}`, tone: "success" });
    } catch (error) {
      addToast({
        title: "Unable to update role",
        description: error instanceof Error ? error.message : undefined,
        tone: "error",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Delete ${user.email}? This also deletes their applications. This can't be undone.`)) {
      return;
    }
    setPendingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      addToast({ title: `${user.email} deleted`, tone: "info" });
    } catch (error) {
      addToast({
        title: "Unable to delete user",
        description: error instanceof Error ? error.message : undefined,
        tone: "error",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to dashboard
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-h1 font-semibold text-ink">User management</h1>
            <p className="text-sm text-ink-muted">Manage accounts and admin access</p>
          </div>
        </div>

        {stats && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-2 text-ink-muted">
                <Users className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-[13px]">Total Users</span>
              </div>
              <p className="mt-2 font-mono text-stat font-semibold tabular-nums text-ink">
                {stats.totalUsers}{" "}
                <span className="text-sm font-normal text-ink-muted">
                  ({stats.totalAdmins} admin{stats.totalAdmins === 1 ? "" : "s"})
                </span>
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-ink-muted">
                <Briefcase className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-[13px]">Total Applications</span>
              </div>
              <p className="mt-2 font-mono text-stat font-semibold tabular-nums text-ink">
                {stats.totalApplications}
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-ink-muted">
                <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-[13px]">Platform Offer Rate</span>
              </div>
              <p className="mt-2 font-mono text-stat font-semibold tabular-nums text-ink">
                {stats.totalApplications > 0
                  ? `${Math.round((stats.stageCounts.Offer / stats.totalApplications) * 100)}%`
                  : "—"}
              </p>
            </Card>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
          {loading ? (
            <div className="space-y-3 p-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : usersError ? (
            <div className="p-5">
              <ErrorState
                title="Couldn't load users"
                description="Something went wrong while fetching accounts."
                onRetry={fetchUsers}
              />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border font-mono text-caption uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Applications</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSelf = user.id === session?.user?.id;
                  return (
                    <tr key={user.id} data-testid={`admin-user-row-${user.id}`}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink">{user.name || "—"}</p>
                        <p className="text-ink-muted">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span data-testid={`admin-user-role-${user.id}`}>
                          <Badge tone={user.role === "admin" ? "accent" : "neutral"}>{user.role}</Badge>
                        </span>
                        {isSelf && <span className="ml-2 text-[12px] text-ink-faint">(you)</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-ink-muted">{user._count.applications}</td>
                      <td className="px-5 py-4 font-mono text-[13px] text-ink-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            data-testid={`admin-toggle-role-${user.id}`}
                            disabled={pendingId === user.id || (isSelf && user.role === "admin")}
                            onClick={() => handleRoleToggle(user)}
                          >
                            Make {user.role === "admin" ? "user" : "admin"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            data-testid={`admin-delete-user-${user.id}`}
                            disabled={pendingId === user.id || isSelf}
                            onClick={() => handleDelete(user)}
                            className="px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
