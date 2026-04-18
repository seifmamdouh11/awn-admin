"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Filter
} from "lucide-react";
import Swal from "sweetalert2";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import api from "../../utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Plan {
  id: number;
  name: string;
  tier: string;
  user_type: "volunteer" | "company";
  description: string;
  price: number;
  duration_days: number;
  benefits: any;
  is_active: boolean;
}

interface Subscription {
  id: number;
  user_name: string;
  user_email: string;
  user_type: string;
  plan_name: string;
  tier: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function SubscriptionsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "company" | "volunteer">("all");

  const fetchData = useCallback(async () => {
    try {
      const plansRes = await api.get("/admin-subscriptions/plans");
      setPlans(plansRes.data);
      const subsRes = await api.get("/admin-subscriptions/active");
      setSubscriptions(subsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrEditPlan = async (plan?: Plan) => {
    const { value: formValues } = await Swal.fire({
      background: '#171717',
      title: `<h2 class="text-2xl font-extrabold text-[#ffffff] tracking-tight">${plan ? tr.managePlans : tr.managePlans}</h2>`,
      html: `
        <div class="space-y-5 text-left pt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.planName}</label>
            <input id="swal-name" class="w-full rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none placeholder-[#ffffff]/30 shadow-inner" value="${plan?.name || ''}" placeholder="...">
          </div>
          
          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.userType}</label>
              <select id="swal-user-type" class="w-full rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none appearance-none shadow-inner" ${plan ? 'disabled' : ''}>
                <option value="company" class="bg-[#171717] text-[#ffffff]" ${plan?.user_type === 'company' ? 'selected' : ''}>${tr.companyType}</option>
                <option value="volunteer" class="bg-[#171717] text-[#ffffff]" ${plan?.user_type === 'volunteer' ? 'selected' : ''}>${tr.volunteerType}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.tier}</label>
              <input id="swal-tier" class="w-full rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none shadow-inner" value="${plan?.tier || 'basic'}">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.priceEgp}</label>
              <input id="swal-price" type="number" class="w-full rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none shadow-inner" value="${plan?.price || 0}">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.durationDays}</label>
              <input id="swal-duration" type="number" class="w-full rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none shadow-inner" value="${plan?.duration_days || 30}">
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest ml-1">${tr.description}</label>
            <textarea id="swal-desc" class="w-full resize-none rounded-xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm font-medium text-[#ffffff] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none h-20 shadow-inner" placeholder="...">>${plan?.description || ''}</textarea>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-end ml-1">
              <label class="text-[10px] font-bold text-[#ffffff]/60 uppercase tracking-widest">${tr.benefitsPayload}</label>
              <span class="text-[9px] font-bold text-[#171717] bg-[#F5A623] uppercase tracking-widest px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(245,166,35,0.3)]">JSON</span>
            </div>
            <textarea id="swal-benefits" class="w-full resize-none rounded-xl border border-[#ffffff]/5 bg-[#000000]/40 px-4 py-3 text-sm font-mono text-[#F5A623] transition-all focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none h-28 custom-scrollbar placeholder-[#ffffff]/20 shadow-inner" placeholder='{\n  "withdrawal_fee": 0,\n  "priority_support": true\n}'>${plan?.benefits ? (typeof plan.benefits === 'string' ? plan.benefits : JSON.stringify(plan.benefits, null, 2)) : ''}</textarea>
          </div>
        </div>
      `,
      customClass: {
        popup: 'rounded-[2rem] border border-[#ffffff]/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] pb-4',
        confirmButton: 'rounded-xl bg-[#F5A623] px-8 py-3 text-sm font-extrabold text-[#171717] shadow-[0_4px_14px_0_rgba(245,166,35,0.39)] hover:bg-[#F5A623]/90 hover:shadow-[0_6px_20px_rgba(245,166,35,0.23)] transition-all m-2',
        cancelButton: 'rounded-xl px-6 py-3 text-sm font-bold text-[#ffffff]/60 hover:bg-[#ffffff]/5 hover:text-[#ffffff] transition-colors m-2 bg-transparent',
        actions: 'w-full px-6 flex justify-end gap-2 border-t border-[#ffffff]/10 pt-5 mt-6',
      },
      buttonsStyling: false,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: tr.applyChange,
      cancelButtonText: tr.cancel,
      preConfirm: () => {
        const benefitsRaw = (document.getElementById('swal-benefits') as HTMLTextAreaElement).value;
        let benefits = null;
        try {
          if (benefitsRaw.trim()) benefits = JSON.parse(benefitsRaw);
        } catch (e) {
          Swal.showValidationMessage(`<div class="text-sm font-bold text-red-400 bg-red-400/10 py-2 px-4 rounded-lg mt-2 border border-red-400/20">${tr.invalidJson}</div>`);
          return false;
        }

        return {
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          user_type: (document.getElementById('swal-user-type') as HTMLSelectElement).value,
          tier: (document.getElementById('swal-tier') as HTMLInputElement).value,
          price: Number((document.getElementById('swal-price') as HTMLInputElement).value),
          duration_days: Number((document.getElementById('swal-duration') as HTMLInputElement).value),
          description: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
          benefits: benefits,
          is_active: plan ? plan.is_active : true
        }
      }
    });

    if (formValues) {
      try {
        if (plan) {
          await api.put(`/admin-subscriptions/plans/${plan.id}`, formValues);
        } else {
          await api.post("/admin-subscriptions/plans", formValues);
        }
        Swal.fire({
          icon: 'success',
          background: '#171717',
          title: `<h3 class="text-xl font-extrabold text-[#ffffff]">${tr.success}</h3>`,
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl border border-[#ffffff]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]' }
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          background: '#171717',
          title: `<h3 class="text-xl font-extrabold text-[#ffffff]">${tr.error}</h3>`,
          text: "Failed to save plan",
          color: '#ffffff',
          customClass: {
            popup: 'rounded-3xl border border-[#ffffff]/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]',
            confirmButton: 'rounded-xl bg-[#F5A623] px-8 py-2.5 text-sm font-extrabold text-[#171717] transition-all hover:bg-[#F5A623]/90'
          },
          buttonsStyling: false
        });
      }
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      await api.put(`/admin-subscriptions/plans/${plan.id}`, { ...plan, is_active: !plan.is_active });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: tr.error, text: "Failed to update plan status" });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-[#febc5a]/30 border-t-[#febc5a] animate-spin" />
    </div>
  );

  const filteredSubs = filterType === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.user_type === filterType);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">{tr.subscriptionsDesk}</h1>
          <p className="text-foreground/60 font-medium">{tr.managePlans}</p>
        </div>
        <button
          onClick={() => handleCreateOrEditPlan()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#febc5a] text-black font-bold shadow-lg shadow-[#febc5a]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          {lang === 'ar' ? 'إضافة خطة' : 'Create New Plan'}
        </button>
      </motion.div>

      {/* Plans Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {plans.map((plan, idx) => (
            <motion.div
              layout
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              className={`relative overflow-hidden group p-6 rounded-[2.5rem] border ${plan.is_active ? 'border-foreground/5 bg-background' : 'border-red-500/20 bg-red-500/[0.02] grayscale opacity-70'} shadow-sm hover:shadow-xl transition-all duration-500`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${plan.user_type === 'company' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <CreditCard size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCreateOrEditPlan(plan)}
                    className="p-2 rounded-xl bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground transition"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => togglePlanStatus(plan)}
                    className={`p-2 rounded-xl ${plan.is_active ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'} transition`}
                    title={plan.is_active ? tr.reject : tr.approve}
                  >
                    {plan.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-foreground/5 text-foreground/40">
                    {plan.user_type === 'company' ? tr.companyType : tr.volunteerType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#febc5a]/10 text-[#febc5a]">
                    {plan.tier}
                  </span>
                </div>
                <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                <p className="text-sm text-foreground/50 line-clamp-2 h-10">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-foreground">{Number(plan.price).toLocaleString()}</span>
                <span className="text-sm font-bold text-foreground/30 uppercase tracking-widest">{tr.egp} / {plan.duration_days} {tr.days}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Subscriptions Ledger */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
            <Users size={24} className="text-[#febc5a]" />
            {tr.activeSubscriptions}
          </h2>
          <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-2xl border border-foreground/10">
            {["all", "company", "volunteer"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type
                  ? 'bg-background text-[#febc5a] shadow-sm'
                  : 'text-foreground/40 hover:text-foreground'
                  }`}
              >
                {type === 'all' ? tr.all : type === 'company' ? tr.companiesDesk : tr.volunteersDesk}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-foreground/5 bg-foreground/[0.02] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs font-bold text-foreground/40 uppercase tracking-widest text-center">
                  <th className="pb-4 text-start ps-5">{tr.company}/{tr.volunteersDesk}</th>
                  <th className="pb-4">{tr.managePlans}</th>
                  <th className="pb-4">{tr.durationDays}</th>
                  <th className="pb-4">{tr.status}</th>
                  <th className="pb-4 pe-5 text-end">{tr.posted}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-foreground/20 font-black uppercase tracking-widest italic">{tr.noSubsFound}</td>
                  </tr>
                ) : (
                  filteredSubs.map((sub, idx) => {
                    const expiry = new Date(sub.end_date);
                    const isExpired = expiry < new Date();

                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-center"
                      >
                        <td className="p-5 text-start ps-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-base text-foreground">{sub.user_name}</span>
                            <span className="text-[11px] text-foreground/40 font-semibold">{sub.user_email}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-foreground uppercase tracking-tight">{sub.plan_name}</span>
                            <span className="text-[10px] font-bold text-[#febc5a] uppercase tracking-widest">{sub.tier}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/60">
                              <span>{new Date(sub.start_date).toLocaleDateString()}</span>
                              <ChevronRight size={12} className={lang === 'ar' ? 'rotate-180' : ''} />
                              <span className={isExpired ? 'text-red-500' : 'text-emerald-500'}>{new Date(sub.end_date).toLocaleDateString()}</span>
                            </div>
                            {isExpired && <span className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">{tr.expired}</span>}
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'ACTIVE' && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                            }`}>
                            {sub.status === 'ACTIVE' ? tr.activeStatus : tr.cancelledStatus}
                          </span>
                        </td>
                        <td className="p-5 text-end pe-5">
                          <span className="text-sm font-semibold text-foreground/40 italic">
                            {new Date(sub.start_date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
