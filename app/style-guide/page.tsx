"use client";

import { Inbox, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

const COLOR_GROUPS: { label: string; swatches: { name: string; className: string }[] }[] = [
  {
    label: "Surfaces",
    swatches: [
      { name: "canvas", className: "bg-canvas border border-border" },
      { name: "surface", className: "bg-surface border border-border" },
      { name: "surface-sunken", className: "bg-surface-sunken border border-border" },
    ],
  },
  {
    label: "Text",
    swatches: [
      { name: "ink", className: "bg-ink" },
      { name: "ink-muted", className: "bg-ink-muted" },
      { name: "ink-faint", className: "bg-ink-faint" },
    ],
  },
  {
    label: "Accent",
    swatches: [
      { name: "accent", className: "bg-accent" },
      { name: "accent-strong", className: "bg-accent-strong" },
      { name: "accent-soft", className: "bg-accent-soft border border-border" },
    ],
  },
  {
    label: "Pipeline stages",
    swatches: [
      { name: "applied (neutral)", className: "bg-applied" },
      { name: "interview", className: "bg-interview" },
      { name: "offer", className: "bg-offer" },
      { name: "rejected", className: "bg-rejected" },
    ],
  },
];

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-canvas px-6 py-10 text-ink sm:px-10">
      <div className="mx-auto max-w-4xl space-y-14">
        <header>
          <p className="font-mono text-caption uppercase tracking-wide text-ink-faint">
            Internal — review only
          </p>
          <h1 className="mt-1 text-h1 font-semibold text-ink">TALA design system</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Restrained enterprise SaaS direction. This page is temporary — it exists so the
            tokens and primitives can be checked in the browser before any real screen is
            touched. Safe to delete once the redesign is approved.
          </p>
        </header>

        {/* Color */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Color</h2>
          <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {COLOR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[13px] font-medium text-ink-muted">{group.label}</p>
                <div className="space-y-2">
                  {group.swatches.map((swatch) => (
                    <div key={swatch.name} className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-md ${swatch.className}`} />
                      <span className="font-mono text-[12px] text-ink-muted">{swatch.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type scale */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Type scale</h2>
          <div className="mt-4 space-y-4 rounded-lg border border-border bg-surface p-6">
            <div>
              <p className="text-display font-semibold text-ink">Display 40 / Instrument Sans</p>
              <p className="font-mono text-[12px] text-ink-faint">landing hero only</p>
            </div>
            <div>
              <p className="text-h1 font-semibold text-ink">H1 28 / Instrument Sans</p>
              <p className="font-mono text-[12px] text-ink-faint">page titles</p>
            </div>
            <div>
              <p className="text-h2 font-semibold text-ink">H2 20 / Instrument Sans</p>
              <p className="font-mono text-[12px] text-ink-faint">section titles</p>
            </div>
            <div>
              <p className="text-h3 font-semibold text-ink">H3 16 / Instrument Sans</p>
              <p className="font-mono text-[12px] text-ink-faint">card titles</p>
            </div>
            <div>
              <p className="text-sm text-ink">Body 14 / Inter Tight — default body and UI text</p>
            </div>
            <div>
              <p className="text-[13px] text-ink-muted">Small 13 / Inter Tight — secondary/meta text</p>
            </div>
            <div>
              <p className="font-mono text-caption uppercase tracking-wide text-ink-muted">
                Caption 11 / Inter Tight — eyebrow labels, column headers
              </p>
            </div>
            <div>
              <p className="font-mono text-stat font-semibold tabular-nums text-ink">128</p>
              <p className="font-mono text-[12px] text-ink-faint">
                Stat 30 / IBM Plex Mono — the one signature numeric thread used for every stat,
                date, and count across the app
              </p>
            </div>
          </div>
        </section>

        {/* Radius / shadow */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Radius &amp; elevation</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-sm border border-border bg-surface shadow-xs" />
              <p className="mt-2 font-mono text-[12px] text-ink-muted">radius-sm 6px</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-md border border-border bg-surface shadow-sm" />
              <p className="mt-2 font-mono text-[12px] text-ink-muted">radius-md 8px</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-lg border border-border bg-surface shadow-md" />
              <p className="mt-2 font-mono text-[12px] text-ink-muted">radius-lg 12px</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Button</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
          </div>
        </section>

        {/* Input */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Input</h2>
          <div className="mt-4 grid max-w-sm gap-4">
            <Input label="Company" placeholder="e.g. Acme Corp" />
            <Input label="Work email" defaultValue="taken@example.com" error="This email is already registered" />
            <Input label="Read only" defaultValue="Cannot edit" disabled />
          </div>
        </section>

        {/* Badge */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Badge</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="applied" dot>
              Applied
            </Badge>
            <Badge tone="interview" dot>
              Interview
            </Badge>
            <Badge tone="offer" dot>
              Offer
            </Badge>
            <Badge tone="rejected" dot>
              Rejected
            </Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="danger">Danger</Badge>
          </div>
        </section>

        {/* Card */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Card</h2>
          <div className="mt-4 grid max-w-sm gap-4">
            <Card>
              <p className="text-h3 font-semibold text-ink">Card title</p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Flat surface, hairline border, subtle shadow — no translucency or blur.
              </p>
            </Card>
          </div>
        </section>

        {/* Empty state */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Empty state</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <EmptyState
              icon={Inbox}
              title="No applications yet"
              description="Applications you add will show up here, organized by stage."
              action={<Button size="sm">Add application</Button>}
            />
            <EmptyState
              icon={Search}
              title="No results"
              description="Try a different search term or clear your filters."
            />
          </div>
        </section>

        {/* Loading state */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Loading state</h2>
          <Card className="mt-4 max-w-sm space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </section>

        {/* Error state */}
        <section>
          <h2 className="text-h2 font-semibold text-ink">Error state</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ErrorState
              title="Couldn't load applications"
              description="Something went wrong while fetching your pipeline."
              onRetry={() => {}}
            />
            <div className="space-y-3">
              <Banner tone="danger">Invalid email or password.</Banner>
              <Banner tone="success">Photo uploaded.</Banner>
              <Banner tone="neutral">Local writes affect the shared database.</Banner>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
