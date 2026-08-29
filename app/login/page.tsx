"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Bell, LayoutGrid } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Copy describes real, shipped features only (Kanban pipeline stages,
// the Reports page stat cards, and the interview reminders banner) —
// not aspirational marketing claims.
const VALUE_POINTS = [
  { icon: LayoutGrid, text: "Track every application through one pipeline, from applied to offer." },
  { icon: BarChart3, text: "See response rate, offer rate, and time-to-interview at a glance." },
  { icon: Bell, text: "Get reminded before every upcoming interview." },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Brand panel — compact bar on mobile, full side panel on desktop.
          Deliberately ONE h1 that resizes, not a hidden duplicate, so the
          heading structure stays simple and matches what smoke.spec.ts checks. */}
      <div className="bg-accent px-6 py-10 text-white md:flex md:w-1/2 md:flex-col md:justify-between md:px-12 md:py-16 lg:w-[45%]">
        <h1 className="font-display text-h1 font-bold md:text-display">TALA</h1>
        <div className="mt-6 hidden md:block">
          <p className="max-w-sm text-lg text-white/90">
            A single, considered place to run your job search like a pipeline.
          </p>
          <ul className="mt-8 space-y-5">
            {VALUE_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/80">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 hidden text-[13px] text-white/50 md:block">
          Job Application Pipeline Manager
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-sm">
          <h2 className="text-h2 font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink-muted">Welcome back — enter your details to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <Banner tone="danger" data-testid="login-error">
                {error}
              </Banner>
            )}
            <Input
              id="login-email"
              data-testid="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="login-password"
              data-testid="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" data-testid="login-submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-accent hover:text-accent-strong">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
