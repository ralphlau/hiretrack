"use client";

export const dynamic = "force-dynamic";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Download,
  History,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastContainer, useToast } from "@/hooks/useToast";
import { STAGE_DOT, STAGE_TEXT, type Priority, type Stage } from "@/types";

interface StatusChange {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  createdAt: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  salary?: string;
  status: string;
  notes?: string;
  appliedDate: string;
  workType?: string;
  priority?: string;
  interviewDate?: string | null;
  photoUrl?: string | null;
  statusChanges?: StatusChange[];
}

const STAGES: Stage[] = ["Applied", "Interview", "Offer", "Rejected"];

function getInitials(company: string) {
  const fallback = company.trim().slice(0, 2).toUpperCase();
  return fallback || "AT";
}

function formatDuration(fromIso: string, toIso: string) {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  const days = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  if (days === 0) return "same day";
  if (days === 1) return "1 day later";
  return `${days} days later`;
}

function SortableApplicationCard({
  app,
  onSelect,
  stage,
}: {
  app: Application;
  onSelect: (application: Application) => void;
  stage: Stage;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    touchAction: "none",
    willChange: "transform",
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      data-testid={`application-card-${app.id}`}
      onClick={() => onSelect(app)}
      style={style}
      className="w-full rounded-lg border border-border bg-surface p-3 text-left shadow-xs transition-colors hover:border-border-strong hover:shadow-sm"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent-strong">
            {getInitials(app.company)}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{app.company}</p>
            <p className="text-[13px] text-ink-muted">{app.role}</p>
          </div>
        </div>
        <StatusBadge kind="stage" value={stage} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="neutral">{app.workType ?? "Work type TBD"}</Badge>
        <StatusBadge kind="priority" value={(app.priority as Priority) ?? "Medium"} />
      </div>

      <div className="mt-3 flex items-center gap-1.5 font-mono text-[12px] text-ink-faint">
        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
        {new Date(app.appliedDate).toLocaleDateString()}
      </div>
    </button>
  );
}

function StageColumn({
  stage,
  applications,
  onSelect,
}: {
  stage: Stage;
  applications: Application[];
  onSelect: (application: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      data-testid={`stage-column-${stage.toLowerCase()}`}
      className={`rounded-lg border p-3 transition-colors ${
        isOver ? "border-accent bg-accent-soft" : "border-border bg-surface-sunken"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${STAGE_DOT[stage]}`} />
          <h3 className={`truncate text-sm font-semibold ${STAGE_TEXT[stage]}`}>{stage}</h3>
        </div>
        <span className="shrink-0 rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[12px] text-ink-muted">
          {applications.length}
        </span>
      </div>

      <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-3 space-y-2">
          {applications.length === 0 ? (
            <EmptyState
              title="No applications"
              description="Drag a card here or add one above."
              className="py-6"
            />
          ) : (
            applications.map((app) => (
              <SortableApplicationCard key={app.id} app={app} onSelect={onSelect} stage={stage} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, addToast, dismissToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [reminders, setReminders] = useState<
    { id: string; date: string; company: string; role: string }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", role: "", email: "", phone: "" });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );
  const [form, setForm] = useState({
    company: "",
    role: "",
    jobUrl: "",
    salary: "",
    notes: "",
    status: "Applied" as Stage,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchApplications();
      void fetchReminders();
    }
  }, [status]);

  useEffect(() => {
    if (selectedApp) {
      void fetchContacts(selectedApp.id);
      setShowContactForm(false);
      setContactForm({ name: "", role: "", email: "", phone: "" });
    } else {
      setContacts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApp?.id]);

  const fetchContacts = async (applicationId: string) => {
    setContactsLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/contacts`, {
        credentials: "include",
      });
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      addToast({ title: "Unable to load contacts", tone: "error" });
    } finally {
      setContactsLoading(false);
    }
  };

  const handleAddContact = async (applicationId: string) => {
    if (!contactForm.name.trim()) {
      addToast({ title: "Contact name is required", tone: "error" });
      return;
    }
    setIsSavingContact(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          role: contactForm.role.trim() || null,
          email: contactForm.email.trim() || null,
          phone: contactForm.phone.trim() || null,
        }),
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Unable to add contact");

      setContacts((prev) => [payload, ...prev]);
      setContactForm({ name: "", role: "", email: "", phone: "" });
      setShowContactForm(false);
      addToast({ title: "Contact added", tone: "success" });
    } catch (error) {
      addToast({
        title: "Unable to add contact",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error || "Unable to remove contact");
      }
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (error) {
      addToast({
        title: "Unable to remove contact",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
      setFetchError(false);
    } catch (error) {
      console.error(error);
      setFetchError(true);
      addToast({
        title: "Unable to refresh applications",
        description: "Please try again in a moment.",
        tone: "error",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          company: form.company.trim(),
          role: form.role.trim(),
          salary: form.salary.trim() || null,
          notes: form.notes.trim() || null,
        }),
        credentials: "include",
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Unable to add application");
      }

      setShowModal(false);
      setForm({
        company: "",
        role: "",
        jobUrl: "",
        salary: "",
        notes: "",
        status: "Applied",
      });
      setApplications((prev) => [payload, ...prev]);
      addToast({
        title: "Application added",
        description: `${payload.company} is now tracked in your pipeline.`,
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Unable to add application",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Stage) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to update status");
      }

      await fetchApplications();
      setSelectedApp(null);
      addToast({
        title: "Stage updated",
        description: `${payload.company} moved to ${newStatus}.`,
        tone: "info",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Unable to update stage",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    }
  };

  const handleSetInterviewDate = async (id: string, interviewDate: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate: interviewDate ? new Date(interviewDate).toISOString() : null,
        }),
        credentials: "include",
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to update interview date");
      }

      await fetchApplications();
      await fetchReminders();
      setSelectedApp((prev) => (prev ? { ...prev, interviewDate: payload.interviewDate } : prev));
      addToast({ title: "Interview date updated", tone: "success" });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Unable to update interview date",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    }
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/applications/${id}/photo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to upload photo");
      }

      await fetchApplications();
      setSelectedApp((prev) => (prev ? { ...prev, photoUrl: payload.photoUrl } : prev));
      addToast({ title: "Photo uploaded", tone: "success" });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Unable to upload photo",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Unable to delete application");
      }

      setApplications((prev) => prev.filter((app) => app.id !== id));
      setSelectedApp(null);
      addToast({
        title: "Application removed",
        description: "The record has been removed from your pipeline.",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Unable to delete application",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    }
  };

  const getByStage = (stage: Stage) => applications.filter((app) => app.status === stage);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // `over.id` is either a column's stage id (dropped on empty space) or
    // another card's id (dropped directly on a card, which is the natural
    // thing to do while reordering) — resolve to a real Stage either way
    // instead of assuming it's always a stage id.
    const isDirectStageId = (STAGES as string[]).includes(overIdStr);
    const targetStage = isDirectStageId
      ? (overIdStr as Stage)
      : (applications.find((app) => app.id === overIdStr)?.status as Stage | undefined);

    if (!targetStage) return;

    const draggedApplication = applications.find((app) => app.id === activeIdStr);

    if (!draggedApplication || draggedApplication.status === targetStage) return;

    const previousStatus = draggedApplication.status;

    setApplications((prev) =>
      prev.map((app) => (app.id === activeIdStr ? { ...app, status: targetStage } : app))
    );

    try {
      const res = await fetch(`/api/applications/${activeIdStr}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStage }),
        credentials: "include",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Unable to update status");

      addToast({
        title: "Stage updated",
        description: `${payload.company} moved to ${targetStage}.`,
        tone: "info",
      });
      void fetchApplications(true);
      void fetchReminders();
    } catch (error) {
      console.error(error);
      setApplications((prev) =>
        prev.map((app) => (app.id === activeIdStr ? { ...app, status: previousStatus } : app))
      );
      addToast({
        title: "Unable to update stage",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
          <div className="hidden w-72 shrink-0 rounded-lg border border-border bg-surface p-5 lg:block">
            <Skeleton className="h-3 w-24" />
            <div className="mt-6 space-y-3">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-36" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="hidden w-72 shrink-0 rounded-lg border border-border bg-surface p-5 shadow-xs lg:flex lg:flex-col">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-sm font-semibold text-white">
                TA
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">TALA</p>
                <p className="text-[13px] text-ink-muted">Portfolio dashboard</p>
              </div>
            </div>
            <nav className="mt-8 space-y-1">
              {[
                { label: "Overview", icon: LayoutGrid, active: true, href: null },
                { label: "Reports", icon: BarChart3, active: false, href: "/reports" },
              ].map((item) => {
                const Icon = item.icon;
                const className = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  item.active
                    ? "bg-accent-soft text-accent-strong"
                    : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                }`;
                if (item.href) {
                  return (
                    <a key={item.label} href={item.href} className={className}>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {item.label}
                    </a>
                  );
                }
                return (
                  <button key={item.label} type="button" className={className}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-md border border-border bg-surface-sunken p-4">
            <p className="text-[13px] font-medium text-ink">Signed in as</p>
            <p className="mt-1 truncate text-[13px] text-ink-muted">
              {session?.user?.email ?? session?.user?.name ?? "—"}
            </p>
            {session?.user?.role === "admin" && (
              <div className="mt-2">
                <Badge tone="accent">Admin</Badge>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-caption uppercase tracking-wide text-ink-faint">Overview</p>
              <h1 className="mt-1 text-h1 font-semibold text-ink">Applications</h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                {applications.length} tracked across {STAGES.length} pipeline stages.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {session?.user?.role === "admin" && (
                <Button
                  type="button"
                  variant="secondary"
                  data-testid="admin-link-button"
                  onClick={() => router.push("/admin")}
                >
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                  Manage users
                </Button>
              )}
              <a href="/api/applications/export" data-testid="export-csv-button">
                <Button type="button" variant="secondary">
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Export CSV
                </Button>
              </a>
              <Button type="button" data-testid="add-application-button" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Add application
              </Button>
              <Button
                type="button"
                variant="ghost"
                data-testid="sign-out-button"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sign out
              </Button>
            </div>
          </Card>

          {reminders.length > 0 && (
            <div
              data-testid="reminders-banner"
              className="mt-6 rounded-md border border-interview-soft bg-interview-soft p-4"
            >
              <div className="flex items-center gap-2 text-interview">
                <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                <p className="text-sm font-medium">
                  {reminders.length} upcoming interview{reminders.length === 1 ? "" : "s"} in the
                  next 7 days
                </p>
              </div>
              <ul className="mt-2 space-y-1 text-[13px] text-ink-muted">
                {reminders.map((r) => {
                  const matched = applications.find((app) => app.id === r.id);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        data-testid={`reminder-row-${r.id}`}
                        disabled={!matched}
                        onClick={() => matched && setSelectedApp(matched)}
                        className="flex w-full items-center justify-between rounded-sm px-1 py-0.5 text-left transition-colors enabled:hover:bg-surface enabled:hover:text-ink disabled:cursor-default"
                      >
                        <span>
                          {r.company} — {r.role}
                        </span>
                        <span className="font-mono text-[12px]">
                          {new Date(r.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Applications"
              value={applications.length}
              caption="Tracked in your active pipeline"
              icon={Briefcase}
            />
            <StatCard
              label="Interviews"
              value={getByStage("Interview").length}
              caption="Moving into conversations"
              icon={CalendarDays}
            />
            <StatCard
              label="Offers"
              value={getByStage("Offer").length}
              caption="Positive momentum"
              icon={Sparkles}
            />
            <StatCard
              label="Rejected"
              value={getByStage("Rejected").length}
              caption="Closed loops"
              icon={BarChart3}
            />
          </section>

          <Card className="mt-6" padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-h2 font-semibold text-ink">Pipeline overview</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  A clearer view of each hiring stage and the most recent activity.
                </p>
              </div>
              <Badge tone="neutral">Stage flow</Badge>
            </div>

            {fetchError && applications.length === 0 ? (
              <ErrorState
                title="Couldn't load applications"
                description="Something went wrong while fetching your pipeline."
                onRetry={() => fetchApplications()}
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
              >
                <div className="grid gap-4 xl:grid-cols-4">
                  {STAGES.map((stage) => (
                    <StageColumn
                      key={stage}
                      stage={stage}
                      applications={getByStage(stage)}
                      onSelect={setSelectedApp}
                    />
                  ))}
                </div>
                <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
                  {activeId
                    ? (() => {
                        const draggedApp = applications.find((app) => app.id === activeId);
                        if (!draggedApp) return null;
                        return (
                          <div className="w-72 rotate-2 cursor-grabbing rounded-lg border border-accent bg-surface p-3 text-left shadow-lg">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent-strong">
                                {getInitials(draggedApp.company)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-ink">{draggedApp.company}</p>
                                <p className="text-[13px] text-ink-muted">{draggedApp.role}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    : null}
                </DragOverlay>
              </DndContext>
            )}
          </Card>
        </main>
      </div>

      {showModal && (
        <div
          data-testid="application-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-surface p-7 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h2 font-semibold text-ink">Add application</h2>
                <p className="mt-1 text-sm text-ink-muted">Capture the next opportunity in seconds.</p>
              </div>
              <button
                type="button"
                data-testid="close-application-modal"
                onClick={() => setShowModal(false)}
                className="rounded-md p-2 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                id="application-company"
                data-testid="application-company"
                label="Company *"
                type="text"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                placeholder="e.g. Stripe"
                required
              />
              <Input
                id="application-role"
                data-testid="application-role"
                label="Role *"
                type="text"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                placeholder="e.g. QA Engineer"
                required
              />
              <Input
                id="application-jobUrl"
                data-testid="application-jobUrl"
                label="Job URL"
                type="url"
                value={form.jobUrl}
                onChange={(event) => setForm({ ...form, jobUrl: event.target.value })}
                placeholder="https://..."
              />
              <Input
                id="application-salary"
                data-testid="application-salary"
                label="Salary"
                type="text"
                value={form.salary}
                onChange={(event) => setForm({ ...form, salary: event.target.value })}
                placeholder="e.g. 25,000"
              />
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-muted" htmlFor="application-status">
                  Status
                </label>
                <select
                  id="application-status"
                  data-testid="application-status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as Stage })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-muted" htmlFor="application-notes">
                  Notes
                </label>
                <textarea
                  id="application-notes"
                  data-testid="application-notes"
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  className="min-h-24 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent-soft"
                  placeholder="Anything worth remembering?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  data-testid="cancel-application"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="save-application"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedApp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 px-4"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-surface p-7 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] text-ink-muted">Selected application</p>
                <h2 className="mt-1 text-h2 font-semibold text-ink">{selectedApp.company}</h2>
                <p className="mt-1 text-sm text-ink-muted">{selectedApp.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-md p-2 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-md border border-border bg-surface-sunken p-3 text-sm text-ink">
                <div className="mb-2 flex items-center gap-2 text-ink-muted">
                  <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
                  Photo
                </div>
                {selectedApp.photoUrl ? (
                  <img
                    src={selectedApp.photoUrl}
                    alt={`${selectedApp.company} attachment`}
                    className="mb-2 max-h-40 w-full rounded-md object-cover"
                  />
                ) : null}
                <label
                  htmlFor="photo-upload"
                  className="block w-full cursor-pointer rounded-md border border-dashed border-border-strong px-2 py-2 text-center text-[13px] text-ink-muted transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {isUploadingPhoto
                    ? "Uploading…"
                    : selectedApp.photoUrl
                      ? "Replace photo"
                      : "Upload photo (JPEG, PNG, WEBP, or GIF, up to 5MB)"}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  data-testid="photo-upload-input"
                  className="hidden"
                  disabled={isUploadingPhoto}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(selectedApp.id, file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-3 text-sm text-ink">
                <span className="text-ink-muted">Status</span>
                <StatusBadge kind="stage" value={selectedApp.status as Stage} />
              </div>
              {selectedApp.salary ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-3 text-sm">
                  <span className="text-ink-muted">Salary</span>
                  <span className="font-mono text-ink">{selectedApp.salary}</span>
                </div>
              ) : null}
              {selectedApp.jobUrl ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-3 text-sm">
                  <span className="text-ink-muted">Job URL</span>
                  <a
                    href={selectedApp.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-40 truncate text-accent hover:text-accent-strong hover:underline"
                  >
                    View posting
                  </a>
                </div>
              ) : null}
              {selectedApp.notes ? (
                <div className="rounded-md border border-border bg-surface-sunken p-3 text-sm text-ink">
                  <p className="mb-1 text-ink-muted">Notes</p>
                  <p>{selectedApp.notes}</p>
                </div>
              ) : null}
              <div className="rounded-md border border-border bg-surface-sunken p-3 text-sm">
                <label htmlFor="interview-date" className="mb-1 block text-ink-muted">
                  Interview date
                </label>
                <input
                  id="interview-date"
                  type="date"
                  data-testid="interview-date-input"
                  defaultValue={
                    selectedApp.interviewDate
                      ? new Date(selectedApp.interviewDate).toISOString().split("T")[0]
                      : ""
                  }
                  onBlur={(e) => handleSetInterviewDate(selectedApp.id, e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-sm text-ink [color-scheme:light]"
                />
              </div>
            </div>

            {selectedApp.statusChanges && selectedApp.statusChanges.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-ink-muted">
                  <History className="h-4 w-4" strokeWidth={1.75} />
                  Status history
                </div>
                <ul className="space-y-1.5 text-[13px] text-ink-muted">
                  {selectedApp.statusChanges.map((sc, index) => {
                    const previousChangeAt =
                      selectedApp.statusChanges![index + 1]?.changedAt ?? selectedApp.appliedDate;
                    return (
                      <li key={sc.id} className="flex items-center justify-between gap-3">
                        <span>
                          {sc.fromStatus ? `${sc.fromStatus} → ${sc.toStatus}` : `Set to ${sc.toStatus}`}
                          <span className="text-ink-faint"> · {formatDuration(previousChangeAt, sc.changedAt)}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[12px] text-ink-faint">
                          {new Date(sc.changedAt).toLocaleDateString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <Users className="h-4 w-4" strokeWidth={1.75} />
                  Contacts
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="add-contact-toggle"
                  onClick={() => setShowContactForm((prev) => !prev)}
                >
                  {showContactForm ? "Cancel" : "+ Add contact"}
                </Button>
              </div>

              {contactsLoading ? (
                <Skeleton className="h-10" />
              ) : (
                <>
                  {contacts.length === 0 && !showContactForm && (
                    <p className="text-[13px] text-ink-faint">
                      No contacts yet — add a recruiter or referral for this application.
                    </p>
                  )}
                  {contacts.length > 0 && (
                    <ul className="space-y-2">
                      {contacts.map((contact) => (
                        <li
                          key={contact.id}
                          data-testid={`contact-row-${contact.id}`}
                          className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface-sunken p-3 text-[13px]"
                        >
                          <div>
                            <p className="font-medium text-ink">
                              {contact.name}
                              {contact.role && <span className="text-ink-muted"> · {contact.role}</span>}
                            </p>
                            {contact.email && <p className="text-ink-muted">{contact.email}</p>}
                            {contact.phone && <p className="text-ink-muted">{contact.phone}</p>}
                          </div>
                          <button
                            type="button"
                            data-testid={`delete-contact-${contact.id}`}
                            onClick={() => handleDeleteContact(contact.id)}
                            className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface hover:text-danger"
                            aria-label={`Remove ${contact.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {showContactForm && (
                <div className="mt-3 space-y-3 rounded-md border border-border bg-surface-sunken p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Name *"
                      data-testid="contact-name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Jordan Lee"
                    />
                    <Input
                      label="Role"
                      data-testid="contact-role"
                      value={contactForm.role}
                      onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                      placeholder="e.g. Recruiter"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Email"
                      type="email"
                      data-testid="contact-email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="jordan@company.com"
                    />
                    <Input
                      label="Phone"
                      data-testid="contact-phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="save-contact"
                    disabled={isSavingContact}
                    onClick={() => handleAddContact(selectedApp.id)}
                    className="w-full"
                  >
                    {isSavingContact ? "Saving..." : "Save contact"}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm text-ink-muted">Move to stage</p>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.filter((stage) => stage !== selectedApp.status).map((stage) => (
                  <Button
                    key={stage}
                    type="button"
                    variant="secondary"
                    size="sm"
                    data-testid={`move-to-${stage.toLowerCase()}-button`}
                    onClick={() => handleStatusChange(selectedApp.id, stage)}
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              data-testid="delete-application-button"
              onClick={() => handleDelete(selectedApp.id)}
              className="mt-6 w-full"
            >
              Delete application
            </Button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
