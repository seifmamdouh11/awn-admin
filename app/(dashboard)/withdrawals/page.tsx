"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Search, 
  TrendingUp,
  Banknote,
  Smartphone,
  CreditCard
} from "lucide-react";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import Swal from "sweetalert2";
import { API_URL as API } from "../../utils/api";

type Withdrawal = {
  id: number;
  volunteer_id: number;
  amount_requested: number;
  admin_commission: number;
  net_amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  method: "wallet" | "paypal" | "bank";
  account_details: string;
};

export default function WithdrawalsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = () => localStorage.getItem("adminToken");
  const headers = useCallback(() => ({ Authorization: `Bearer ${token()}` }), []);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/withdrawals/admin/all`, { headers: headers() });
      setWithdrawals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    const actionText = status === "approved" ? tr.confirmPay : tr.rejectRefund;
    
    const result = await Swal.fire({
      title: tr.areYouSure,
      text: status === "approved" 
        ? (isRTL ? "سيتم تعيين هذا الطلب كمدفوع." : "This will mark the request as paid.")
        : (isRTL ? "سيتم رفض الطلب وإعادة المبلغ لرصيد المتطوع." : "This will reject the request and refund the balance."),
      icon: status === "approved" ? "info" : "warning",
      showCancelButton: true,
      confirmButtonText: actionText,
      confirmButtonColor: status === "approved" ? "#10B981" : "#EF4444",
      cancelButtonText: tr.cancel,
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${API}/withdrawals/admin/${id}`, { status }, { headers: headers() });
        Swal.fire({
          icon: "success",
          title: status === "approved" ? tr.payoutSuccess : tr.payoutRejected,
          timer: 2000,
          showConfirmButton: false
        });
        fetchWithdrawals();
      } catch (e) {
        const err = e as { response?: { data?: { error?: string } } };
        Swal.fire("Error", err.response?.data?.error || "Failed to process", "error");
      }
    }
  };

  const filtered = withdrawals.filter(w => {
    const matchesSearch = 
      (w.first_name + " " + w.last_name).toLowerCase().includes(filter.toLowerCase()) ||
      w.email.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#febc5a]/20 border-t-[#febc5a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
             <div className="p-2 bg-[#febc5a]/10 rounded-xl text-[#d97706]">
                <Banknote size={28} />
             </div>
             {tr.withdrawalsTitle}
          </h1>
          <p className="text-foreground/50 mt-1 font-medium">{tr.withdrawalsSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder={tr.searchVolunteer}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#febc5a]/50 w-full sm:w-64"
                />
            </div>
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-xl text-sm focus:outline-none cursor-pointer"
            >
                <option value="all">{tr.allStatuses}</option>
                <option value="pending">{tr.pending}</option>
                <option value="approved">{tr.active}</option>
                <option value="rejected">{tr.cancelled}</option>
            </select>
        </div>
      </div>

      {/* Main Stats Summary (Optional Small Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="p-6 rounded-3xl border border-[#febc5a]/20 bg-[#febc5a]/5 flex items-center gap-4">
            <div className="p-3 bg-[#febc5a]/20 rounded-2xl text-[#d97706]">
                <TrendingUp size={20} />
            </div>
            <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#d97706]/70">{isRTL ? "إجمالي العمولات" : "Platform Revenue"}</p>
                <p className="text-xl font-black text-[#d97706]">
                    {withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + Number(w.admin_commission), 0).toLocaleString()} <span className="text-xs">EGP</span>
                </p>
            </div>
         </div>
         {/* More summary cards could go here */}
      </div>

      {/* Table Section */}
      <div className="rounded-[2.5rem] border border-foreground/10 bg-background/80 backdrop-blur-md shadow-sm overflow-hidden border-b-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left" dir={isRTL ? "rtl" : "ltr"}>
            <thead className="bg-foreground/[0.03]">
              <tr className="text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-foreground/5">
                <th className="px-6 py-5">{isRTL ? "المتطوع" : "Volunteer"}</th>
                <th className="px-6 py-5">{isRTL ? "طريقة السحب" : "Destination"}</th>
                <th className="px-6 py-5">{tr.amountRequested}</th>
                <th className="px-6 py-5">{tr.adminFee}</th>
                <th className="px-6 py-5 font-bold text-[#d97706] bg-[#febc5a]/5">{tr.netToPay}</th>
                <th className="px-6 py-5 text-center">{tr.status}</th>
                <th className="px-6 py-5 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                         <Clock size={48} />
                         <p className="font-bold">{tr.noWithdrawals}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((w, i) => (
                    <motion.tr 
                      key={w.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-foreground/[0.01] transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center font-black text-xs text-foreground/40 group-hover:bg-[#febc5a]/20 group-hover:text-[#d97706] transition-colors">
                             {w.first_name[0]}{w.last_name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{w.first_name} {w.last_name}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-medium">
                                 <Mail size={10} /> {w.email}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-foreground/5 rounded-xl text-foreground/40">
                             {w.method === 'wallet' ? <Smartphone size={16} /> : w.method === 'paypal' ? <Mail size={16} /> : <CreditCard size={16} />}
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                {w.method === 'wallet' ? (isRTL ? 'محفظة' : 'Wallet') : w.method === 'paypal' ? 'PayPal' : (isRTL ? 'بنك' : 'Bank')}
                              </p>
                              <p className="text-xs font-bold text-foreground/70">{w.account_details || w.phone}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-foreground/70">
                         {Number(w.amount_requested).toLocaleString()} <span className="text-[10px] opacity-40">EGP</span>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-foreground/40">
                         {Number(w.admin_commission).toFixed(2)} <span className="text-[10px] opacity-40">EGP</span>
                      </td>
                      <td className="px-6 py-5 font-black text-sm text-[#d97706] bg-[#febc5a]/5">
                         {Number(w.net_amount).toLocaleString()} <span className="text-[10px] opacity-60">EGP</span>
                      </td>
                      <td className="px-6 py-5">
                          <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(w.status)}`}>
                                {w.status === 'approved' ? <CheckCircle2 size={12}/> : w.status === 'rejected' ? <XCircle size={12}/> : <Clock size={12}/>}
                                {tr[w.status as keyof typeof tr]}
                              </span>
                          </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center justify-center gap-2">
                           {w.status === "pending" ? (
                             <>
                               <button 
                                 onClick={() => handleAction(w.id, "approved")}
                                 title={tr.confirmPay}
                                 className="h-9 px-4 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                               >
                                 {isRTL ? "صرف" : "Pay"}
                               </button>
                               <button 
                                 onClick={() => handleAction(w.id, "rejected")}
                                 title={tr.rejectRefund}
                                 className="h-9 w-9 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-95"
                               >
                                 <XCircle size={18} />
                               </button>
                             </>
                           ) : (
                               <span className="text-[10px] font-black text-foreground/20 italic">
                                  {new Date(w.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                               </span>
                           )}
                         </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
