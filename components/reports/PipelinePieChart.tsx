"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STAGE_HEX, type Stage } from "@/types";

interface StageDatum {
  name: string;
  value: number;
}

/**
 * Split out into its own client-only chunk (loaded via next/dynamic with
 * ssr: false in reports/page.tsx) so recharts — a genuinely heavy
 * dependency in the bundle — isn't part of the /reports route's initial
 * JS. The page shell and stat cards render immediately; this pops in
 * a moment later instead of blocking first paint.
 */
export function PipelinePieChart({ data }: { data: StageDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STAGE_HEX[entry.name as Stage]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e3e1dc",
            borderRadius: 8,
            color: "#17171a",
            fontSize: 13,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
