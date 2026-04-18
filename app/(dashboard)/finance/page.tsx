"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
   BarChart3,
   Clock,
   CheckCircle2,
   XCircle,
   Info,
   TrendingUp
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import api from "../../utils/api";

const fadeUp = {
   hidden: { opacity: 0, y: 15 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Deposit {
  id: number;
  company_name: string;
  email: string;
  amount: number;
  method: string;
  reference_id: string;
  created_at: string;
}

interface Earning {
  id: string | number;
  created_at: string;
  earning_type: string;
  source_name: string;
  amount: number;
}

export default function FinancePage() {
   const { lang } = useLang();
   const tr = t[lang as keyof typeof t];

   const [revenue, setRevenue] = useState({ total_rev: 0, commission_rev: 0, subscription_rev: 0, total_transactions: 0 });
   const [deposits, setDeposits] = useState<Deposit[]>([]);
   const [earnings, setEarnings] = useState<Earning[]>([]);
   const [loading, setLoading] = useState(true);

   const [activeTab, setActiveTab] = useState<'commissions' | 'subscriptions' | 'withdrawals'>('commissions');

   const filteredEarnings = earnings.filter(earn => {
      if (activeTab === 'commissions') return earn.earning_type === 'Opportunity Commission';
      if (activeTab === 'subscriptions') return earn.earning_type === 'Subscription Purchase';
      if (activeTab === 'withdrawals') return earn.earning_type === 'Withdrawal Fee';
      return true;
   });

   const tabTotal = filteredEarnings.reduce((acc, curr) => acc + Number(curr.amount), 0);

   const fetchData = useCallback(async () => {
      try {
         const revRes = await api.get("/admin-finance/revenue");
         setRevenue(revRes.data);
         const depRes = await api.get("/admin-finance/deposits");
         setDeposits(depRes.data);
         const earnRes = await api.get("/admin-finance/earnings-detailed");
         setEarnings(earnRes.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleVerify = async (id: number, status: 'APPROVED' | 'REJECTED') => {
      const { value: notes } = await Swal.fire({
         title: status === 'APPROVED' ? tr.approveDeposit : tr.rejectDeposit,
         input: 'textarea',
         inputLabel: tr.adminNotesPlaceholder,
         inputPlaceholder: 'Enter any notes here...',
         showCancelButton: true,
         confirmButtonText: tr.applyChange,
         cancelButtonText: tr.cancel,
         confirmButtonColor: status === 'APPROVED' ? '#10B981' : '#EF4444'
      });

      if (notes === undefined) return; // Cancelled

      try {
         await api.put(`/admin-finance/deposits/${id}/verify`, { status, admin_notes: notes });
         Swal.fire({
            icon: 'success',
            title: tr.reviewSuccess,
            timer: 1500,
            showConfirmButton: false
         });
         fetchData();
      } catch (err) {
         console.error(err);
         Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to verify deposit' });
      }
   };

   if (loading) return (
      <div className="min-h-[400px] flex items-center justify-center">
         <div className="h-8 w-8 rounded-full border-4 border-[#febc5a]/30 border-t-[#febc5a] animate-spin" />
      </div>
   );

   return (
      <div className="space-y-8 pb-20">
         {/* Header */}
         <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-black text-foreground tracking-tight">{tr.financeDesk}</h1>
               <p className="text-foreground/60 font-medium">{tr.withdrawalsSubtitle}</p>
            </div>
            <div className="flex items-center gap-4">
               <Link 
                  href="/finance/analytics" 
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#febc5a] text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-[#febc5a]/20 hover:scale-105 transition-transform"
               >
                  <TrendingUp size={16} />
                  {tr.viewAnalytics}
               </Link>
               <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  <Clock size={14} />
                  Real-time Financial Audit
               </div>
            </div>
         </motion.div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="rounded-3xl border border-foreground/5 bg-background p-8 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#febc5a]/10 flex items-center justify-center text-[#febc5a]">
                     <BarChart3 size={24} />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                     {tr.platformRevenue}
                  </div>
               </div>
               <p className="text-4xl font-black text-foreground tabular-nums">
                  {Number(revenue.total_rev || (revenue as any).total_commission || 0).toLocaleString()} <span className="text-lg text-foreground/40 font-bold">EGP</span>
               </p>
               <p className="mt-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  {revenue.total_rev 
                    ? `${tr.commissionRev}: ${Number(revenue.commission_rev).toLocaleString()} | ${tr.subscriptionRev}: ${Number(revenue.subscription_rev).toLocaleString()}`
                    : `From ${revenue.total_transactions} processed payouts`
                  }
               </p>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="rounded-3xl border border-foreground/5 bg-background p-8 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40">
                     <Clock size={24} />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider">
                     {tr.pendingDeposits}
                  </div>
               </div>
               <p className="text-4xl font-black text-foreground tabular-nums">
                  {deposits.length}
               </p>
               <p className="mt-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  Transactions awaiting verification
               </p>
            </motion.div>
         </div>

         {/* Pending Deposits Table */}
         <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Info size={20} className="text-[#febc5a]" />
                  {tr.verifyDeposit}
               </h2>
            </div>

            <div className="rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.02] p-6 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                     <thead>
                        <tr className="text-xs font-bold text-foreground/40 uppercase tracking-widest text-center">
                           <th className="pb-4">{tr.company}</th>
                           <th className="pb-4">{tr.amount}</th>
                           <th className="pb-4">{tr.method}</th>
                           <th className="pb-4">{tr.referenceId}</th>
                           <th className="pb-4">{tr.date}</th>
                           <th className="pb-4">{tr.action}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {deposits.length === 0 ? (
                           <tr>
                              <td colSpan={6} className="py-20 text-center text-foreground/30 font-bold uppercase tracking-widest">{tr.noDeposits}</td>
                           </tr>
                        ) : (
                           deposits.map((dep: Deposit, idx) => (
                              <motion.tr
                                 key={dep.id}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: 0.1 * idx }}
                                 className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-center"
                              >
                                 <td className="p-5 font-bold text-foreground">
                                    <div className="flex flex-col">
                                       <span>{dep.company_name}</span>
                                       <span className="text-[10px] text-foreground/40 font-semibold">{dep.email}</span>
                                    </div>
                                 </td>
                                 <td className="p-5 font-black text-foreground tabular-nums">{Number(dep.amount).toLocaleString()} ج.م</td>
                                 <td className="p-5">
                                    <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground/60 text-[10px] font-bold tracking-widest uppercase">
                                       {dep.method}
                                    </span>
                                 </td>
                                 <td className="p-5">
                                    <code className="px-3 py-1 rounded-lg bg-foreground/5 text-foreground/80 text-xs font-mono">
                                       {dep.reference_id}
                                    </code>
                                 </td>
                                 <td className="p-5 text-sm text-foreground/40 font-semibold">
                                    {new Date(dep.created_at).toLocaleDateString()}
                                 </td>
                                 <td className="p-5">
                                    <div className="flex items-center justify-center gap-2">
                                       <button
                                          onClick={() => handleVerify(dep.id, 'APPROVED')}
                                          className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition group-hover:scale-110"
                                          title={tr.approve}
                                       >
                                          <CheckCircle2 size={18} />
                                       </button>
                                       <button
                                          onClick={() => handleVerify(dep.id, 'REJECTED')}
                                          className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition group-hover:scale-110"
                                          title={tr.reject}
                                       >
                                          <XCircle size={18} />
                                       </button>
                                    </div>
                                 </td>
                              </motion.tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </motion.div>

         {/* Earnings Ledger Section with Tabs */}
         <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
               <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                     <BarChart3 size={20} className="text-[#febc5a]" />
                     {tr.earningsLedger}
                  </h2>
                  <p className="text-xs text-foreground/40 font-medium">{tr.earningsSubtitle}</p>
               </div>
               
               {/* Tab Switcher */}
               <div className="flex p-1 bg-foreground/5 rounded-2xl border border-foreground/10 relative">
                  {(['commissions', 'subscriptions', 'withdrawals'] as const).map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative z-10 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                           activeTab === tab ? 'text-black' : 'text-foreground/40 hover:text-foreground/70'
                        }`}
                     >
                        {tab === 'commissions' ? tr.commissionRev : tab === 'subscriptions' ? tr.subscriptionRev : tr.withdrawFee}
                        {activeTab === tab && (
                           <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-[#febc5a] rounded-xl -z-10 shadow-lg shadow-[#febc5a]/20"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                           />
                        )}
                     </button>
                  ))}
               </div>
            </div>

            {/* Segment Stats Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-3xl border border-[#febc5a]/20 bg-[#febc5a]/5 p-6 flex flex-col justify-center"
               >
                  <span className="text-[10px] font-bold text-[#febc5a] uppercase tracking-[0.2em] mb-1">
                     {activeTab === 'commissions' ? tr.commissionRev : activeTab === 'subscriptions' ? tr.subscriptionRev : tr.withdrawFee} Total
                  </span>
                  <p className="text-2xl font-black text-foreground">
                     {tabTotal.toLocaleString()} <span className="text-xs text-foreground/40">EGP</span>
                  </p>
               </motion.div>
               <div className="sm:col-span-2 rounded-3xl border border-foreground/5 bg-foreground/[0.01] p-6 flex items-center text-xs text-foreground/40 font-medium italic">
                  Showing {filteredEarnings.length} records in this category.
               </div>
            </div>

            <div className="rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.02] p-6 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                     <thead>
                        <tr className="text-xs font-bold text-foreground/40 uppercase tracking-widest text-center">
                           <th className="pb-4">{tr.date}</th>
                           <th className="pb-4">{tr.earningType}</th>
                           <th className="pb-4">{tr.sourceEntity}</th>
                           <th className="pb-4">{tr.amount}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredEarnings.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="py-20 text-center text-foreground/30 font-bold uppercase tracking-widest italic">No {activeTab} records captured yet</td>
                           </tr>
                        ) : (
                           filteredEarnings.map((earn: Earning, idx) => (
                              <motion.tr
                                 key={`${earn.id}-${idx}`}
                                 initial={{ opacity: 0, y: 5 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: 0.05 * idx }}
                                 className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-center"
                              >
                                 <td className="p-5 text-sm text-foreground/40 font-semibold">
                                    {new Date(earn.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                 </td>
                                 <td className="p-5 font-bold">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${earn.earning_type === 'Opportunity Commission'
                                       ? 'bg-emerald-500/10 text-emerald-500'
                                       : earn.earning_type === 'Subscription Purchase'
                                          ? 'bg-purple-500/10 text-purple-500'
                                          : 'bg-blue-500/10 text-blue-500'
                                       }`}>
                                       {earn.earning_type === 'Opportunity Commission'
                                          ? tr.oppCommission
                                          : earn.earning_type === 'Subscription Purchase'
                                             ? tr.subscriptionPurchase
                                             : tr.withdrawFee
                                       }
                                    </span>
                                 </td>
                                 <td className="p-5 font-bold text-foreground">
                                    {earn.source_name}
                                 </td>
                                 <td className="p-5 font-black text-emerald-500 tabular-nums">
                                    + {Number(earn.amount).toLocaleString()} ج.م
                                 </td>
                              </motion.tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </motion.div>
      </div>
   );
}
