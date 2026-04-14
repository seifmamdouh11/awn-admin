"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

// ─── Shared helpers ────────────────────────────────────────────────────────────

const tooltipDefaults = {
  backgroundColor: "rgba(15,15,15,0.85)",
  titleColor: "#febc5a",
  bodyColor: "#ededed",
  borderColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 12,
};

// ─── Company Status Doughnut ───────────────────────────────────────────────────

type StatusRow = { status: string; count: number };

export function CompanyStatusChart({ data }: { data: StatusRow[] }) {
  const COLORS: Record<string, string> = {
    pending:   "#f59e0b",
    approved:  "#10b981",
    rejected:  "#ef4444",
    blocked:   "#6b7280",
  };

  const labels = data.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1));
  const values = data.map((d) => Number(d.count));
  const colors = data.map((d) => COLORS[d.status] ?? "#9ca3af");

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map((c) => c + "cc"),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8,
        }],
      }}
      options={{
        cutout: "72%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#888", font: { size: 12, weight: "bold" }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` }, ...tooltipDefaults },
        },
        responsive: true,
        maintainAspectRatio: true,
      }}
    />
  );
}

// ─── Volunteer Status Doughnut ─────────────────────────────────────────────────

export function VolunteerStatusChart({ data }: { data: StatusRow[] }) {
  const COLORS: Record<string, string> = {
    active:   "#3b82f6",
    inactive: "#6b7280",
    banned:   "#ef4444",
  };

  const labels = data.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1));
  const values = data.map((d) => Number(d.count));
  const colors = data.map((d) => COLORS[d.status] ?? "#9ca3af");

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map((c) => c + "cc"),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8,
        }],
      }}
      options={{
        cutout: "72%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#888", font: { size: 12, weight: "bold" }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` }, ...tooltipDefaults },
        },
        responsive: true,
        maintainAspectRatio: true,
      }}
    />
  );
}

// ─── Event Status Doughnut ────────────────────────────────────────────────────

export function EventStatusChart({ data }: { data: StatusRow[] }) {
  const COLORS: Record<string, string> = {
    open:      "#10b981",
    draft:     "#9ca3af",
    closed:    "#6b7280",
    completed: "#3b82f6",
    cancelled: "#ef4444",
  };

  const labels = data.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1));
  const values = data.map((d) => Number(d.count));
  const colors = data.map((d) => COLORS[d.status] ?? "#9ca3af");

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map((c) => c + "cc"),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8,
        }],
      }}
      options={{
        cutout: "72%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#888", font: { size: 12, weight: "bold" }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` }, ...tooltipDefaults },
        },
        responsive: true,
        maintainAspectRatio: true,
      }}
    />
  );
}

// ─── Events Per Month Bar ──────────────────────────────────────────────────────

type MonthRow = { month: string; count: number };

export function EventsBarChart({ data }: { data: MonthRow[] }) {
  const labels = data.map((d) => {
    const [y, m] = d.month.split("-");
    return new Date(+y, +m - 1).toLocaleString("default", { month: "short", year: "2-digit" });
  });

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: "Events Posted",
          data: data.map((d) => Number(d.count)),
          backgroundColor: "rgba(168,85,247,0.4)",
          borderColor: "#a855f7",
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        }],
      }}
      options={{
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltipDefaults },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#666", font: { size: 11 } } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#666", font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
        },
        responsive: true,
        maintainAspectRatio: true,
      }}
    />
  );
}

// ─── Applications Line Chart ───────────────────────────────────────────────────

export function ApplicationsLineChart({ data }: { data: MonthRow[] }) {
  const labels = data.map((d) => {
    const [y, m] = d.month.split("-");
    return new Date(+y, +m - 1).toLocaleString("default", { month: "short", year: "2-digit" });
  });

  return (
    <Line
      data={{
        labels,
        datasets: [{
          label: "Applications",
          data: data.map((d) => Number(d.count)),
          fill: true,
          backgroundColor: "rgba(254,188,90,0.12)",
          borderColor: "#febc5a",
          pointBackgroundColor: "#febc5a",
          pointBorderColor: "#febc5a",
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.4,
          borderWidth: 2.5,
        }],
      }}
      options={{
        plugins: {
          legend: { display: false },
          tooltip: { ...tooltipDefaults },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#666", font: { size: 11 } } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#666", font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
        },
        responsive: true,
        maintainAspectRatio: true,
      }}
    />
  );
}
