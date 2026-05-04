"use client";

/**
 * Centralized Chart.js setup for the app. Imported by `ChartCard` and the
 * concrete chart wrappers below — registering controllers and elements here
 * once avoids duplicate registrations and keeps tree-shaking predictable.
 */

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Chart, Doughnut, Line, PolarArea, Radar } from "react-chartjs-2";
import { applyChartDefaults } from "@/lib/chart-theme";

ChartJS.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LinearScale,
  LineElement,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Tooltip,
);

applyChartDefaults();

export {
  Bar as BarChart,
  Chart as MixedChart,
  Doughnut as DoughnutChart,
  Line as LineChart,
  PolarArea as PolarAreaChart,
  Radar as RadarChart,
};
