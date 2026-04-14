"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Building2, CalendarDays, TrendingUp, RefreshCw, BarChart3, PieChart, LineChart } from "lucide-react";
import { useLang } from "../Hooks/LangProvider";
import t from "../translations";
import dynamic from "next/dynamic";
import { useAdmin } from "../Context/AdminContext";

const EventStatusChart = dynamic(() => import("../components/Charts").then(m => m.EventStatusChart), { ssr: false });
const CompanyStatusChart = dynamic(() => import("../components/Charts").then(m => m.CompanyStatusChart), { ssr: false });
const VolunteerStatusChart = dynamic(() => import("../components/Charts").then(m => m.VolunteerStatusChart), { ssr: false });
const EventsBarChart = dynamic(() => import("../components/Charts").then(m => m.EventsBarChart), { ssr: false });
const ApplicationsLineChart = dynamic(() => import("../components/Charts").then(m => m.ApplicationsLineChart), { ssr: false });

import { API_URL as API } from "../utils/api";

type Stats = { volunteers: number; pending_companies: number; active_events: number; impact_count: number };
type StatusRow = { status: string; count: number };
type MonthRow = { month: string; count: number };
type ChartData = { companyStatus: StatusRow[]; volunteerStatus: StatusRow[]; eventStatus: StatusRow[]; eventsPerMonth: MonthRow[]; applicationsPerMonth: MonthRow[] };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }),
};

export default function DashboardPage() {
  const { lang } = useLang();
  const { adminName } = useAdmin();
  const tr = t[lang as keyof typeof t];

  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  const token = () => localStorage.getItem("adminToken");
  const headers = useCallback(() => ({ Authorization: `Bearer ${token()}` }), []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/stats`, { headers: headers() });
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchCharts = useCallback(async () => {
    setChartsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/chart-data`, { headers: headers() });
      setCharts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setChartsLoading(false);
    }
  }, [headers]);

  const refreshAll = () => { fetchStats(); fetchCharts(); };

  useEffect(() => {
    fetchStats();
    fetchCharts();
  }, [fetchStats, fetchCharts]);

  const statCards = stats ? [
    { label: tr.totalVolunteers, value: stats.volunteers, icon: <Users size={22} />, color: "from-blue-500/20 to-transparent", border: "border-blue-500/20", text: "text-blue-500", bg: "bg-blue-500/10" },
    { label: tr.pendingCompanies, value: stats.pending_companies, icon: <Building2 size={22} />, color: "from-amber-500/20 to-transparent", border: "border-amber-500/20", text: "text-amber-500", bg: "bg-amber-500/10" },
    { label: tr.activeOpportunities, value: stats.active_events, icon: <CalendarDays size={22} />, color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/20", text: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: tr.totalImpact, value: stats.impact_count, icon: <TrendingUp size={22} />, color: "from-purple-500/20 to-transparent", border: "border-purple-500/20", text: "text-purple-500", bg: "bg-purple-500/10" },
  ] : [];

  const ChartCard = ({ title, icon, children, colSpan = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; colSpan?: string }) => (
    <div className={`rounded-[2rem] border border-foreground/10 bg-background/80 backdrop-blur-sm p-6 shadow-sm ${colSpan}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-9 w-9 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/50">{icon}</span>
        <h3 className="font-bold text-foreground tracking-tight">{title}</h3>
      </div>
      {chartsLoading
        ? <div className="aspect-square w-full max-w-[260px] mx-auto animate-pulse rounded-full bg-foreground/[0.04]" />
        : children}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {tr.welcomeBack} <span className="text-[#febc5a]">{adminName || "Admin"}</span>
          </h1>
          <p className="text-foreground/50 mt-1 font-medium text-sm">{tr.platformOverview}</p>
        </div>
        <button onClick={refreshAll} className="self-start sm:self-auto flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr.refresh}
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-3xl border border-foreground/5 bg-foreground/[0.03]" />)
          : statCards.map((card, i) => (
            <motion.div key={card.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              className={`relative overflow-hidden rounded-3xl border ${card.border} bg-gradient-to-br ${card.color} p-5 shadow-sm`}>
              <div className={`mb-3 w-fit rounded-2xl ${card.bg} p-2.5 ${card.text}`}>{card.icon}</div>
              <p className="text-xs font-semibold text-foreground/60 leading-snug">{card.label}</p>
              <p className={`mt-1 text-3xl sm:text-4xl font-black ${card.text}`}>{card.value}</p>
            </motion.div>
          ))}
      </div>

      {/* Charts Row 1 — three doughnuts */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title={tr.chartCompanyStatus} icon={<PieChart size={18} />}>
          <div className="max-w-[260px] mx-auto">
            {charts && <CompanyStatusChart data={charts.companyStatus} />}
          </div>
        </ChartCard>

        <ChartCard title={tr.chartVolunteerStatus} icon={<PieChart size={18} />}>
          <div className="max-w-[260px] mx-auto">
            {charts && <VolunteerStatusChart data={charts.volunteerStatus} />}
          </div>
        </ChartCard>

        <ChartCard title={tr.chartEventStatus} icon={<PieChart size={18} />}>
          <div className="max-w-[260px] mx-auto">
            {charts && <EventStatusChart data={charts.eventStatus} />}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 — bar + line */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title={tr.chartEventsBar} icon={<BarChart3 size={18} />}>
          {charts && <EventsBarChart data={charts.eventsPerMonth} />}
        </ChartCard>

        <ChartCard title={tr.chartAppsLine} icon={<LineChart size={18} />}>
          {charts && <ApplicationsLineChart data={charts.applicationsPerMonth} />}
        </ChartCard>
      </div>
    </div>
  );
}
