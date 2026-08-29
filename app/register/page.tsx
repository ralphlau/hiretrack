"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Bell, LayoutGrid } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const VALUE_POINTS = [
  { icon: LayoutGrid, text: "Track every application through one pipeline, from applied to offer." },
  { icon: BarChart3, text: "See response rate, offer rate, and time-to-interview at a glance." },
  { icon: Bell, text: "Get reminded before every upcoming interview." },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Brand panel — same treatment as /login, single h1 that resizes
          rather than a hidden duplicate. */}
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
          <h2 className="text-h2 font-semibold text-ink">Create your account</h2>
          <p className="mt-1 text-sm text-ink-muted">Start tracking your applications in one pipeline.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <Banner tone="danger" data-testid="register-error">
                {error}
              </Banner>
            )}
            <Input
              id="register-name"
              data-testid="register-name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ralph Laurenz Timbol"
              required
            />
            <Input
              id="register-email"
              data-testid="register-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="register-password"
              data-testid="register-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" data-testid="register-submit" disabled={loading} className="w-full">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
