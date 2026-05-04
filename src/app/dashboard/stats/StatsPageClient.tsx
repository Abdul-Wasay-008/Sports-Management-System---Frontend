"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  DoughnutChart,
  LineChart,
  MixedChart,
  RadarChart,
} from "@/components/charts/registry";
import { ChartCard, ChartEmptyState } from "@/components/charts/ChartCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { CHART_COLORS, CHART_PX_HEIGHT, colorForIndex, withAlpha } from "@/lib/chart-theme";
import {
  getDashboardData,
  getDepartmentTrends,
  getMyStats,
  getStats,
  type DepartmentTrendsResponse,
  type MyStatsResponse,
} from "@/lib/student-api";

type StudentDashboard = Awaited<ReturnType<typeof getDashboardData>>;
type DepartmentStats = Awaited<ReturnType<typeof getStats>>;

export default function StatsPageClient() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [my, setMy] = useState<MyStatsResponse | null>(null);
  const [trends, setTrends] = useState<DepartmentTrendsResponse | null>(null);
  const [department, setDepartment] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardData()
      .then(async (dash) => {
        if (cancelled) return;
        setDashboard(dash);
        const [meData, trendsData, deptData] = await Promise.all([
          getMyStats().catch((err) => {
            toast.error(err instanceof ApiError ? err.message : "Failed to load personal stats.");
            return null;
          }),
          getDepartmentTrends().catch((err) => {
            toast.error(err instanceof ApiError ? err.message : "Failed to load trends.");
            return null;
          }),
          getStats({ department: dash.student.department, gender: dash.student.gender }).catch(
            (err) => {
              toast.error(err instanceof ApiError ? err.message : "Failed to load department stats.");
              return null;
            },
          ),
        ]);
        if (cancelled) return;
        setMy(meData);
        setTrends(trendsData);
        setDepartment(deptData);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard."),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell
      title="Statistics"
      subtitle="Your activity at a glance, plus how your department is doing across Sports Week."
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading statistics…
        </div>
      ) : null}

      {my ? <MySummaryCards summary={my.summary} /> : null}

      {my ? (
        <SectionHeading
          title="My activity"
          subtitle="Your personal Sports Week journey: applications, decisions, and what you have explored."
        />
      ) : null}

      {my ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <FunnelChart funnel={my.funnel} />
          <StatusBreakdownChart breakdown={my.statusBreakdown} />
          <ActivityTimelineChart timeline={my.timeline} />
          <SportsRadarChart points={my.sportsRadar} />
        </div>
      ) : null}

      {my && my.cooldowns.length > 0 ? <CooldownList cooldowns={my.cooldowns} /> : null}

      {dashboard && (department || trends) ? (
        <SectionHeading
          title={`${dashboard.student.department} — department trends`}
          subtitle="Where your department stands and how full each game is right now."
        />
      ) : null}

      {department || trends ? (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          {department ? (
            <DepartmentParticipationChart
              items={department.byDepartment}
              myDepartment={dashboard?.student.department ?? ""}
            />
          ) : null}
          {department ? <TopGamesChart items={department.byGame} /> : null}
          {trends ? <SlotUtilizationChart items={trends.slotUtilization} /> : null}
          {trends ? <DemoToAcceptChart items={trends.demoToAccept} /> : null}
        </div>
      ) : null}
    </DashboardShell>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-8 mb-3">
      <h2 className="font-heading text-xl text-brand-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

function MySummaryCards({ summary }: { summary: MyStatsResponse["summary"] }) {
  const cards = [
    { label: "Applied", value: summary.totalApplied, accent: "text-brand-900" },
    { label: "Accepted", value: summary.accepted, accent: "text-emerald-600" },
    { label: "Pending", value: summary.pending, accent: "text-amber-600" },
    { label: "Rejected", value: summary.rejected, accent: "text-rose-600" },
    {
      label: "Accept rate",
      value: summary.acceptRate === null ? "—" : `${summary.acceptRate}%`,
      accent: "text-sky-600",
    },
  ];
  return (
    <div className="mb-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className={`mt-2 font-heading text-3xl ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ funnel }: { funnel: MyStatsResponse["funnel"] }) {
  const max = Math.max(1, ...funnel.map((row) => row.value));
  const data = {
    labels: funnel.map((row) => row.stage),
    datasets: [
      {
        label: "Registrations",
        data: funnel.map((row) => row.value),
        backgroundColor: funnel.map((_, i) =>
          withAlpha(CHART_COLORS.amber, 0.85 - i * 0.18),
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const empty = funnel.every((row) => row.value === 0);
  return (
    <ChartCard
      title="My application funnel"
      subtitle="From applying to getting selected — see where the drop-off happens."
    >
      {empty ? (
        <ChartEmptyState message="You have not applied to any games yet. Head to the Games tab to get started." />
      ) : (
        <BarChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y" as const,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const value = (ctx.parsed.x ?? 0) as number;
                    const start = funnel[0]?.value ?? 0;
                    const pct =
                      start > 0 ? ` · ${Math.round((value / start) * 100)}% of applied` : "";
                    return `${value}${pct}`;
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                suggestedMax: max,
                grid: { color: "rgba(15,23,42,0.05)" },
                ticks: { precision: 0 },
              },
              y: { grid: { display: false } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function StatusBreakdownChart({
  breakdown,
}: {
  breakdown: MyStatsResponse["statusBreakdown"];
}) {
  const labels = ["Accepted", "Demo booked", "Pending", "Rejected", "Cancelled"];
  const values = [
    breakdown.accepted,
    breakdown.demoBooked,
    breakdown.pending,
    breakdown.rejected,
    breakdown.cancelled,
  ];
  const colors = [
    CHART_COLORS.emerald,
    CHART_COLORS.sky,
    CHART_COLORS.amber,
    CHART_COLORS.rose,
    CHART_COLORS.slate,
  ];
  const total = values.reduce((sum, v) => sum + v, 0);
  return (
    <ChartCard
      title="My registration status"
      subtitle="Across every game you have applied to so far."
    >
      {total === 0 ? (
        <ChartEmptyState message="No registrations yet — your status breakdown will appear here once you apply." />
      ) : (
        <DoughnutChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
              legend: { position: "bottom" as const },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const raw = ctx.raw;
                    const value =
                      typeof raw === "number"
                        ? raw
                        : typeof raw === "string"
                          ? Number(raw)
                          : Number(ctx.parsed);
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return `${ctx.label}: ${value} (${pct}%)`;
                  },
                },
              },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function ActivityTimelineChart({
  timeline,
}: {
  timeline: MyStatsResponse["timeline"];
}) {
  const sorted = [...timeline].sort((a, b) => (a.date < b.date ? -1 : 1));
  const cumulativeApps = sorted.reduce<number[]>((acc, row) => {
    const next = (acc.at(-1) ?? 0) + row.applications;
    acc.push(next);
    return acc;
  }, []);
  const labels = sorted.map((row) =>
    new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  );
  return (
    <ChartCard
      title="My activity timeline"
      subtitle="Applications you have submitted and decisions received over time."
    >
      {sorted.length === 0 ? (
        <ChartEmptyState message="No activity yet — once you apply to games, your timeline will appear here." />
      ) : (
        <LineChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels,
            datasets: [
              {
                label: "Cumulative applications",
                data: cumulativeApps,
                borderColor: CHART_COLORS.amber,
                backgroundColor: withAlpha(CHART_COLORS.amber, 0.18),
                fill: true,
                tension: 0.35,
                pointBackgroundColor: CHART_COLORS.amber,
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
              },
              {
                label: "Decisions per day",
                data: sorted.map((row) => row.decisions),
                borderColor: CHART_COLORS.sky,
                backgroundColor: CHART_COLORS.sky,
                tension: 0.35,
                pointRadius: 3,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" as const } },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
              x: { grid: { display: false } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function SportsRadarChart({
  points,
}: {
  points: MyStatsResponse["sportsRadar"];
}) {
  return (
    <ChartCard
      title="Sports tried vs available"
      subtitle="Empty axes are sports you can still explore this week."
    >
      {points.length === 0 ? (
        <ChartEmptyState message="No eligible sports found yet." />
      ) : (
        <RadarChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels: points.map((p) => p.sport),
            datasets: [
              {
                label: "Available to me",
                data: points.map((p) => p.available),
                borderColor: CHART_COLORS.slate,
                backgroundColor: withAlpha(CHART_COLORS.slate, 0.18),
                pointBackgroundColor: CHART_COLORS.slate,
              },
              {
                label: "I have tried",
                data: points.map((p) => p.tried),
                borderColor: CHART_COLORS.amber,
                backgroundColor: withAlpha(CHART_COLORS.amber, 0.35),
                pointBackgroundColor: CHART_COLORS.amber,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" as const } },
            scales: {
              r: {
                min: 0,
                max: 1,
                ticks: { stepSize: 1, display: false },
                pointLabels: { font: { size: 10 } },
                grid: { color: "rgba(15,23,42,0.06)" },
                angleLines: { color: "rgba(15,23,42,0.06)" },
              },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function CooldownList({
  cooldowns,
}: {
  cooldowns: MyStatsResponse["cooldowns"];
}) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-lg text-brand-900">Active rejection cooldowns</h2>
      <p className="mt-1 text-sm text-slate-500">
        After a rejected demo you must wait 10 days before applying for the same game again.
      </p>
      <ul className="mt-4 space-y-3">
        {cooldowns.map((row) => {
          const total = 10;
          const elapsed = Math.max(0, total - row.daysRemaining);
          const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
          return (
            <li key={`${row.gameId}-${row.rejectedAt}`}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-brand-900">{row.gameTitle}</span>
                <span className="text-slate-500">
                  {row.daysRemaining} day{row.daysRemaining === 1 ? "" : "s"} remaining
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-amber-400 to-amber-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Eligible to re-apply on {new Date(row.cooldownEndsAt).toLocaleDateString()}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DepartmentParticipationChart({
  items,
  myDepartment,
}: {
  items: Array<{ label: string; value: number }>;
  myDepartment: string;
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const myRank = sorted.findIndex((row) => row.label === myDepartment);
  return (
    <ChartCard
      title="Accepted registrations by department"
      subtitle={
        myRank >= 0
          ? `Your department ranks #${myRank + 1} of ${sorted.length}.`
          : "How each department compares across accepted registrations."
      }
    >
      {sorted.length === 0 ? (
        <ChartEmptyState message="No accepted registrations recorded yet." />
      ) : (
        <BarChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels: sorted.map((row) => row.label),
            datasets: [
              {
                label: "Accepted registrations",
                data: sorted.map((row) => row.value),
                backgroundColor: sorted.map((row) =>
                  row.label === myDepartment ? CHART_COLORS.amber : CHART_COLORS.brandSoft,
                ),
                borderRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y" as const,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                beginAtZero: true,
                ticks: { precision: 0 },
                grid: { color: "rgba(15,23,42,0.05)" },
              },
              y: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function TopGamesChart({ items }: { items: Array<{ label: string; value: number }> }) {
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 10);
  return (
    <ChartCard
      title="Top games by accepted registrations"
      subtitle="Where most students from your department are getting picked."
    >
      {sorted.length === 0 ? (
        <ChartEmptyState message="No games have any accepted registrations yet." />
      ) : (
        <BarChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels: sorted.map((row) => row.label),
            datasets: [
              {
                label: "Accepted",
                data: sorted.map((row) => row.value),
                backgroundColor: sorted.map((_, i) => colorForIndex(i)),
                borderRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y" as const,
            plugins: { legend: { display: false } },
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
              y: { grid: { display: false } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function SlotUtilizationChart({
  items,
}: {
  items: DepartmentTrendsResponse["slotUtilization"];
}) {
  const visible = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.utilizationPct - a.utilizationPct)
        .slice(0, 10),
    [items],
  );
  return (
    <ChartCard
      title="Slot utilization across eligible games"
      subtitle="Filled vs available seats — useful for spotting games that still have room."
    >
      {visible.length === 0 ? (
        <ChartEmptyState message="No active games available for your category." />
      ) : (
        <BarChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels: visible.map((row) => row.title),
            datasets: [
              {
                label: "Filled",
                data: visible.map((row) => row.accepted),
                backgroundColor: CHART_COLORS.emerald,
                stack: "slots",
                borderRadius: 4,
              },
              {
                label: "Available",
                data: visible.map((row) => row.available),
                backgroundColor: withAlpha(CHART_COLORS.slate, 0.45),
                stack: "slots",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y" as const,
            plugins: {
              legend: { position: "bottom" as const },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}`,
                  afterBody: (ctxs) => {
                    const idx = ctxs[0]?.dataIndex ?? 0;
                    const row = visible[idx];
                    if (!row) return "";
                    return `Utilization: ${row.utilizationPct}%`;
                  },
                },
              },
            },
            scales: {
              x: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
              y: { stacked: true, grid: { display: false } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function DemoToAcceptChart({
  items,
}: {
  items: DepartmentTrendsResponse["demoToAccept"];
}) {
  return (
    <ChartCard
      title="Demo-to-accept rate by game"
      subtitle="Bars show demos requested, line shows the resulting accept rate."
    >
      {items.length === 0 ? (
        <ChartEmptyState message="No demo activity recorded yet." />
      ) : (
        <MixedChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          type="bar"
          data={{
            labels: items.map((row) => row.title),
            datasets: [
              {
                type: "bar",
                label: "Demos started",
                data: items.map((row) => row.demoStarted),
                backgroundColor: withAlpha(CHART_COLORS.amber, 0.85),
                yAxisID: "y",
                borderRadius: 6,
              },
              {
                type: "line",
                label: "Accept rate (%)",
                data: items.map((row) => row.acceptRate),
                borderColor: CHART_COLORS.sky,
                backgroundColor: CHART_COLORS.sky,
                tension: 0.35,
                yAxisID: "y1",
                pointRadius: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" as const } },
            scales: {
              y: {
                position: "left" as const,
                beginAtZero: true,
                ticks: { precision: 0 },
                title: { display: true, text: "Demos" },
              },
              y1: {
                position: "right" as const,
                beginAtZero: true,
                max: 100,
                grid: { drawOnChartArea: false },
                ticks: {
                  callback: (v) => `${v}%`,
                },
                title: { display: true, text: "Accept rate" },
              },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
          }}
        />
      )}
    </ChartCard>
  );
}
