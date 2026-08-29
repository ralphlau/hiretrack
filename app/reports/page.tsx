"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Percent,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { STAGE_HEX, type Stage } from "@/types";

// recharts is a genuinely heavy dependency (~112 kB of this route's First
// Load JS). It renders to SVG and needs no server rendering, so loading it
// client-only via next/dynamic keeps it out of the initial /reports bundle
// — the page shell and stat cards paint immediately, charts pop in after.
const PipelinePieChart = nextDynamic(
  () => import("@/components/reports/PipelinePieChart").then((mod) => mod.PipelinePieChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);
const ApplicationsBarChart = nextDynamic(
  () => import("@/components/reports/ApplicationsBarChart").then((mod) => mod.ApplicationsBarChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

interface ReportData {
  total: number;
  stageCounts: Record<string, number>;
  responseRate: number;
  offerRate: number;
  offerRateAmongInterviewed: number;
  avgDaysToInterview: number | null;
  applicationsOverTime: { month: string; count: number }[];
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function ReportsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadReport = () => {
    setLoading(true);
    setError(false);
    fetch("/api/reports")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const stageData = data
    ? (Object.keys(STAGE_HEX) as Stage[]).map((stage) => ({
        name: stage,
        value: data.stageCounts[stage] ?? 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-canvas px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-muted shadow-xs transition-colors hover:border-border-strong hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Dashboard
          </Link>
          <div>
            <h1 className="text-h1 font-semibold text-ink">Reports</h1>
            <p className="text-sm text-ink-muted">
              Pipeline performance across all your applications.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : error || !data ? (
          <ErrorState
            title="Couldn't load your report"
            description="Something went wrong while calculating pipeline stats."
            onRetry={loadReport}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Applications"
                value={data.total}
                caption="All applications tracked"
                icon={BarChart3}
              />
              <StatCard
                label="Response Rate"
                value={formatPercent(data.responseRate)}
                caption="Reached interview stage"
                icon={TrendingUp}
              />
              <StatCard
                label="Offer Rate"
                value={formatPercent(data.offerRate)}
                caption="Of all applications"
                icon={Percent}
              />
              <StatCard
                label="Avg. Days to Interview"
                value={
                  data.avgDaysToInterview !== null
                    ? Math.round(data.avgDaysToInterview)
                    : "—"
                }
                caption="From application date"
                icon={CalendarClock}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card padding="lg">
                <h2 className="mb-4 text-h3 font-semibold text-ink">Pipeline by Stage</h2>
                <div className="h-64">
                  <PipelinePieChart data={stageData} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  {stageData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-[13px] text-ink-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STAGE_HEX[entry.name as Stage] }}
                      />
                      {entry.name} <span className="font-mono text-[12px]">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="lg">
                <h2 className="mb-4 text-h3 font-semibold text-ink">Applications Over Time</h2>
                <div className="h-64">
                  <ApplicationsBarChart data={data.applicationsOverTime} />
                </div>
              </Card>
            </div>

            <Card padding="lg">
              <h2 className="mb-2 text-h3 font-semibold text-ink">Interview → Offer Conversion</h2>
              <p className="font-mono text-stat font-semibold tabular-nums text-ink">
                {formatPercent(data.offerRateAmongInterviewed)}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Of applications that reached an interview, this share converted to an offer.
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
