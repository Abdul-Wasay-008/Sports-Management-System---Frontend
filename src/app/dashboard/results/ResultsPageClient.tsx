"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  DoughnutChart,
  LineChart,
  PolarAreaChart,
} from "@/components/charts/registry";
import { ChartCard, ChartEmptyState } from "@/components/charts/ChartCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApiError } from "@/lib/api";
import { CHART_COLORS, CHART_PX_HEIGHT, colorForIndex, withAlpha } from "@/lib/chart-theme";
import {
  getDashboardData,
  getGameCategories,
  getResults,
  getResultsStandings,
  type ResultsStandingsResponse,
} from "@/lib/student-api";

type ResultsResponse = Awaited<ReturnType<typeof getResults>>;
type ResultRow = ResultsResponse["results"][number];
type GameCategory = Awaited<ReturnType<typeof getGameCategories>>["categories"][number];
type StudentDashboard = Awaited<ReturnType<typeof getDashboardData>>;

type GenderFilter = "" | "male" | "female" | "mixed";

export default function ResultsPageClient() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [standings, setStandings] = useState<ResultsStandingsResponse | null>(null);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [gender, setGender] = useState<GenderFilter>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [highlightMyDept, setHighlightMyDept] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboardData()
      .then(async (dash) => {
        if (cancelled) return;
        setDashboard(dash);
        const cats = await getGameCategories().catch(() => null);
        if (cancelled) return;
        if (cats) setCategories(cats.categories);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard."),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getResults({
        department: dashboard.student.department,
        gender: gender || undefined,
        gameCategoryId: categoryId || undefined,
      }),
      getResultsStandings({
        gender: gender || undefined,
        gameCategoryId: categoryId || undefined,
      }),
    ])
      .then(([r, s]) => {
        if (cancelled) return;
        setResults(r.results);
        setStandings(s);
      })
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load results."),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dashboard, gender, categoryId]);

  const myDepartment = dashboard?.student.department ?? "";

  return (
    <DashboardShell
      title="Results & Standings"
      subtitle="University-wide outcomes, the medal table, and a feed of recent finals."
    >
      <FiltersBar
        gender={gender}
        onGenderChange={setGender}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        highlightMyDept={highlightMyDept}
        onHighlightChange={setHighlightMyDept}
        myDepartment={myDepartment}
      />

      {loading && !standings ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          Loading standings…
        </div>
      ) : null}

      {standings ? (
        <>
          <SummaryStrip standings={standings} myDepartment={highlightMyDept ? myDepartment : ""} />

          <MedalTableChart
            standings={standings}
            myDepartment={highlightMyDept ? myDepartment : ""}
          />

          <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
            <TitleShareDoughnut standings={standings} />
            <SportsBreakdownChart standings={standings} />
          </div>

          <TimelineChart standings={standings} />
        </>
      ) : null}

      <ResultsList results={results ?? []} myDepartment={highlightMyDept ? myDepartment : ""} />
    </DashboardShell>
  );
}

function FiltersBar({
  gender,
  onGenderChange,
  categoryId,
  onCategoryChange,
  categories,
  highlightMyDept,
  onHighlightChange,
  myDepartment,
}: {
  gender: GenderFilter;
  onGenderChange: (v: GenderFilter) => void;
  categoryId: string;
  onCategoryChange: (v: string) => void;
  categories: GameCategory[];
  highlightMyDept: boolean;
  onHighlightChange: (v: boolean) => void;
  myDepartment: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex flex-col">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value as GenderFilter)}
          className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="">All</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <label className="ml-auto flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={highlightMyDept}
          onChange={(e) => onHighlightChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Highlight {myDepartment || "my department"}
      </label>
    </div>
  );
}

function SummaryStrip({
  standings,
  myDepartment,
}: {
  standings: ResultsStandingsResponse;
  myDepartment: string;
}) {
  const myRow = standings.medalTable.find((row) => row.department === myDepartment);
  const myRank = myDepartment
    ? standings.medalTable.findIndex((row) => row.department === myDepartment)
    : -1;
  const leader = standings.medalTable[0];
  const cards = [
    { label: "Total finals", value: standings.totalEvents, accent: "text-brand-900" },
    {
      label: "Leading department",
      value: leader && leader.gold > 0 ? leader.department : "—",
      accent: "text-amber-600",
      sub: leader && leader.gold > 0 ? `${leader.gold} gold` : "",
    },
    {
      label: myDepartment ? "Your gold medals" : "Top gold count",
      value: myRow ? myRow.gold : leader?.gold ?? 0,
      accent: "text-emerald-600",
    },
    {
      label: myDepartment ? "Your rank" : "Departments competing",
      value: myDepartment
        ? myRank >= 0
          ? `#${myRank + 1}`
          : "—"
        : standings.medalTable.length,
      accent: "text-sky-600",
    },
  ];
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className={`mt-2 font-heading text-2xl ${card.accent}`}>{card.value}</p>
          {card.sub ? <p className="text-xs text-slate-500">{card.sub}</p> : null}
        </div>
      ))}
    </div>
  );
}

function MedalTableChart({
  standings,
  myDepartment,
}: {
  standings: ResultsStandingsResponse;
  myDepartment: string;
}) {
  const rows = useMemo(
    () => standings.medalTable.filter((row) => row.gold + row.silver > 0),
    [standings.medalTable],
  );

  const goldColors = rows.map((row) =>
    row.department === myDepartment ? CHART_COLORS.amberStrong : CHART_COLORS.gold,
  );
  const silverColors = rows.map((row) =>
    row.department === myDepartment
      ? withAlpha(CHART_COLORS.silver, 0.95)
      : withAlpha(CHART_COLORS.silver, 0.7),
  );
  const labelColors = rows.map((row) =>
    row.department === myDepartment ? CHART_COLORS.brand : "#475569",
  );

  const medalCanvasHeight = Math.min(720, Math.max(CHART_PX_HEIGHT, rows.length * 26));

  return (
    <ChartCard
      title="Medal table"
      subtitle="Gold = winners, Silver = runners-up. Click a department in the legend to toggle it."
      height={Math.max(320, rows.length * 28)}
    >
      {rows.length === 0 ? (
        <ChartEmptyState message="No finals have been recorded yet — check back once games conclude." />
      ) : (
        <BarChart
          height={medalCanvasHeight}
          className="max-w-full"
          data={{
            labels: rows.map(
              (row) => `${row.department}${row.department === myDepartment ? "  ★" : ""}`,
            ),
            datasets: [
              {
                label: "Gold",
                data: rows.map((row) => row.gold),
                backgroundColor: goldColors,
                stack: "medals",
                borderRadius: 6,
              },
              {
                label: "Silver",
                data: rows.map((row) => row.silver),
                backgroundColor: silverColors,
                stack: "medals",
                borderRadius: 6,
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
                  afterBody: (ctxs) => {
                    const idx = ctxs[0]?.dataIndex ?? 0;
                    const row = rows[idx];
                    if (!row) return "";
                    return `Total medals: ${row.total}`;
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                beginAtZero: true,
                ticks: { precision: 0 },
              },
              y: {
                stacked: true,
                grid: { display: false },
                ticks: {
                  font: { size: 10 },
                  color: (ctx) => labelColors[ctx.index] ?? "#475569",
                },
              },
            },
          }}
        />
      )}
    </ChartCard>
  );
}

function TitleShareDoughnut({ standings }: { standings: ResultsStandingsResponse }) {
  const winners = standings.medalTable.filter((row) => row.gold > 0);
  const top = winners.slice(0, 6);
  const others = winners.slice(6).reduce((sum, row) => sum + row.gold, 0);
  const labels = [...top.map((row) => row.department), ...(others > 0 ? ["Others"] : [])];
  const values = [...top.map((row) => row.gold), ...(others > 0 ? [others] : [])];
  const total = values.reduce((sum, v) => sum + v, 0);

  return (
    <ChartCard
      title="Title share"
      subtitle="Share of finals won by each department."
    >
      {total === 0 ? (
        <ChartEmptyState message="No titles awarded yet." />
      ) : (
        <DoughnutChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: labels.map((_, i) => colorForIndex(i)),
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
                    const pct = Math.round((value / total) * 100);
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

function SportsBreakdownChart({ standings }: { standings: ResultsStandingsResponse }) {
  const rows = standings.bySport.slice(0, 10);
  return (
    <ChartCard
      title="Medals by sport"
      subtitle="Where the most titles were awarded across Sports Week."
    >
      {rows.length === 0 ? (
        <ChartEmptyState message="No medals recorded against any sport yet." />
      ) : (
        <PolarAreaChart
          height={CHART_PX_HEIGHT}
          className="max-w-full"
          data={{
            labels: rows.map((row) => row.name),
            datasets: [
              {
                label: "Total medals",
                data: rows.map((row) => row.gold + row.silver),
                backgroundColor: rows.map((_, i) => withAlpha(colorForIndex(i), 0.55)),
                borderColor: "#fff",
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" as const, labels: { font: { size: 10 } } },
            },
            scales: {
              r: {
                ticks: { display: false },
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

function TimelineChart({ standings }: { standings: ResultsStandingsResponse }) {
  const sorted = [...standings.timeline].sort((a, b) => (a.date < b.date ? -1 : 1));
  const cumulativeTitles = sorted.reduce<number[]>((acc, row) => {
    const next = (acc.at(-1) ?? 0) + row.titles;
    acc.push(next);
    return acc;
  }, []);
  return (
    <div className="mt-4">
      <ChartCard
        title="Finals over time"
        subtitle="Daily title count and cumulative finals across Sports Week."
        height={300}
      >
        {sorted.length === 0 ? (
          <ChartEmptyState message="No timeline data yet — finals will populate this view as they conclude." />
        ) : (
          <LineChart
            height={CHART_PX_HEIGHT}
            className="max-w-full"
            data={{
              labels: sorted.map((row) =>
                new Date(row.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                }),
              ),
              datasets: [
                {
                  type: "line" as const,
                  label: "Cumulative finals",
                  data: cumulativeTitles,
                  borderColor: CHART_COLORS.amber,
                  backgroundColor: withAlpha(CHART_COLORS.amber, 0.18),
                  fill: true,
                  tension: 0.35,
                  pointBackgroundColor: CHART_COLORS.amber,
                  pointBorderColor: "#fff",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  yAxisID: "y",
                },
                {
                  type: "line" as const,
                  label: "Finals on this day",
                  data: sorted.map((row) => row.titles),
                  borderColor: CHART_COLORS.sky,
                  backgroundColor: CHART_COLORS.sky,
                  borderDash: [4, 4],
                  tension: 0.35,
                  pointRadius: 3,
                  yAxisID: "y1",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" as const } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  title: { display: true, text: "Cumulative" },
                },
                y1: {
                  beginAtZero: true,
                  position: "right" as const,
                  grid: { drawOnChartArea: false },
                  ticks: { precision: 0 },
                  title: { display: true, text: "Per day" },
                },
                x: { grid: { display: false } },
              },
            }}
          />
        )}
      </ChartCard>
    </div>
  );
}

function ResultsList({
  results,
  myDepartment,
}: {
  results: ResultRow[];
  myDepartment: string;
}) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-xl text-brand-900">Recent results</h2>
        <p className="text-sm text-slate-500">{results.length} entr{results.length === 1 ? "y" : "ies"}</p>
      </div>
      {results.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-sm">
          No results match your current filters.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((result) => {
            const isMine =
              myDepartment &&
              (result.winnerDepartment === myDepartment ||
                result.runnerUpDepartment === myDepartment);
            return (
              <article
                key={result._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  isMine ? "border-brand-amber-500" : "border-slate-200/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg text-brand-900">{result.gameTitle}</h3>
                  {result.genderCategory ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {result.genderCategory}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="text-slate-500">Winner:</span>{" "}
                    <span
                      className={`font-medium ${
                        result.winnerDepartment === myDepartment
                          ? "text-emerald-700"
                          : "text-slate-800"
                      }`}
                    >
                      {result.winnerDepartment}
                    </span>
                  </p>
                  {result.runnerUpDepartment ? (
                    <p>
                      <span className="text-slate-500">Runner-up:</span>{" "}
                      <span
                        className={`font-medium ${
                          result.runnerUpDepartment === myDepartment
                            ? "text-emerald-700"
                            : "text-slate-800"
                        }`}
                      >
                        {result.runnerUpDepartment}
                      </span>
                    </p>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Played on {new Date(result.playedAt).toLocaleDateString()}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
