"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowLeft, 
  Calendar,
  DollarSign,
  Briefcase,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useLang } from "../../../Hooks/LangProvider";
import t from "../../../translations";
import api from "../../../utils/api";
import { RevenueLineChart } from "../../../components/Charts";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function FinanceAnalyticsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];

  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(12);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin-finance/analytics?months=${duration}`);
        setAnalyticsData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [duration]);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-[#febc5a]/30 border-t-[#febc5a] animate-spin" />
    </div>
  );

  const totalCommissions = analyticsData.reduce((acc: any, curr: any) => acc + curr.commissions, 0);
  const totalSubscriptions = analyticsData.reduce((acc: any, curr: any) => acc + curr.subscriptions, 0);
  const grandTotal = totalCommissions + totalSubscriptions;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance" 
            className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 hover:bg-[#febc5a]/10 hover:text-[#febc5a] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">{tr.financialAnalytics}</h1>
            <p className="text-foreground/60 font-medium">{tr.analyticsSubtitle}</p>
          </div>
        </div>
        
        <div className="relative group">
          <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#febc5a]" />
          <select 
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="appearance-none bg-[#febc5a]/10 border border-[#febc5a]/20 pl-10 pr-10 py-2.5 rounded-2xl text-[10px] font-black text-[#febc5a] uppercase tracking-widest outline-none cursor-pointer hover:bg-[#febc5a]/20 transition-all"
          >
            <option value={3} className="bg-background text-foreground">{tr.last3Months}</option>
            <option value={6} className="bg-background text-foreground">{tr.last6Months}</option>
            <option value={12} className="bg-background text-foreground">{tr.last12Months}</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#febc5a]">
            <Zap size={10} />
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="rounded-3xl border border-foreground/5 bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Briefcase size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{tr.commissionRevenue}</span>
          </div>
          <p className="text-3xl font-black text-foreground tabular-nums">
            {totalCommissions.toLocaleString()} <span className="text-sm font-bold text-foreground/30">{tr.egp}</span>
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="rounded-3xl border border-foreground/5 bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{tr.subscriptionRevenue}</span>
          </div>
          <p className="text-3xl font-black text-foreground tabular-nums">
            {totalSubscriptions.toLocaleString()} <span className="text-sm font-bold text-foreground/30">{tr.egp}</span>
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="rounded-3xl border border-[#febc5a]/20 bg-[#febc5a]/5 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#febc5a]/20 flex items-center justify-center text-[#febc5a]">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#febc5a]/60">{tr.cumulativeRevenue}</span>
          </div>
          <p className="text-3xl font-black text-foreground tabular-nums">
            {grandTotal.toLocaleString()} <span className="text-sm font-bold text-foreground/30">{tr.egp}</span>
          </p>
        </motion.div>
      </div>

      {/* Main Chart Card */}
      <motion.div 
        variants={fadeUp} 
        initial="hidden" 
        animate="visible" 
        transition={{ delay: 0.4 }}
        className="rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.02] p-8 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">{tr.revenueTrendline}</h2>
            <p className="text-xs text-foreground/40 font-medium italic">{tr.trendSubtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#febc5a]" />
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{tr.all}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{tr.commissionRev}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{tr.subscriptionRev}</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <RevenueLineChart data={analyticsData} />
        </div>
      </motion.div>
    </div>
  );
}
