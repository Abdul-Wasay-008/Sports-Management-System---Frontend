import { Chart, type ChartOptions } from "chart.js";

/**
 * Default pixel height for <canvas> from react-chartjs-2. Without an explicit
 * size, some browsers + flex/grid layouts end up with a 0px-tall chart area
 * (blank white cards) even when `maintainAspectRatio: false` is set.
 */
export const CHART_PX_HEIGHT = 280;

export const CHART_COLORS = {
  brand: "#0c1222",
  brandSoft: "#1e2a42",
  amber: "#f59e0b",
  amberSoft: "rgba(245, 158, 11, 0.18)",
  amberStrong: "#d97706",
  sky: "#0ea5e9",
  skySoft: "rgba(14, 165, 233, 0.18)",
  emerald: "#10b981",
  emeraldSoft: "rgba(16, 185, 129, 0.18)",
  rose: "#f43f5e",
  roseSoft: "rgba(244, 63, 94, 0.18)",
  slate: "#64748b",
  slateSoft: "rgba(100, 116, 139, 0.18)",
  gold: "#f59e0b",
  silver: "#94a3b8",
  bronze: "#b45309",
} as const;

/**
 * Stable color palette used for categorical (department, game) charts. Re-using
 * a single ordered list keeps each label visually identified across reloads.
 */
export const CATEGORICAL_PALETTE: readonly string[] = [
  "#f59e0b",
  "#0ea5e9",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#14b8a6",
  "#eab308",
  "#6366f1",
  "#22c55e",
  "#ec4899",
  "#06b6d4",
  "#a855f7",
  "#84cc16",
  "#f97316",
  "#0284c7",
];

export function colorForIndex(i: number): string {
  return CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length];
}

export function withAlpha(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const value =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

let defaultsApplied = false;

/** Apply project-wide Chart.js defaults exactly once. Safe to call from every chart. */
export function applyChartDefaults() {
  if (defaultsApplied) return;
  defaultsApplied = true;

  Chart.defaults.font.family =
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#475569";
  Chart.defaults.borderColor = "rgba(15, 23, 42, 0.08)";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(12, 18, 34, 0.95)";
  Chart.defaults.plugins.tooltip.titleColor = "#fcd34d";
  Chart.defaults.plugins.tooltip.bodyColor = "#f8fafc";
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxPadding = 6;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxHeight = 8;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.animation = {
    ...Chart.defaults.animation,
    duration: 600,
    easing: "easeOutQuart",
  };
}

export const baseLayoutOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 4,
  },
};
