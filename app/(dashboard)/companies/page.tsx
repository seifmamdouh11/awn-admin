"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Building2, MapPin, Phone, Mail, Globe, X, Calendar, CheckCircle } from "lucide-react";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import { API_URL as API } from "../../utils/api";

type Company = {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  industry?: string;
  city?: string;
  website?: string;
  description?: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  blocked: "bg-red-500/10 text-red-500 border-red-500/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }),
};

export default function CompaniesPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Company | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/all-companies`, { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const updateStatus = async (id: number, currentStatus: string) => {
    const statusOptions: Record<string, Record<string, string>> = {
      pending: { active: tr.active, blocked: tr.blocked },
      active:  { blocked: tr.blocked, pending: tr.pending },
      blocked: { active: tr.active, pending: tr.pending },
    };
    const opts = statusOptions[currentStatus] ?? { active: tr.active, pending: tr.pending, blocked: tr.blocked };

    const { value: newStatus } = await Swal.fire({
      title: tr.updateStatus,
      input: "select",
      inputOptions: opts,
      inputPlaceholder: tr.selectStatus,
      showCancelButton: true,
      confirmButtonColor: "#febc5a",
      confirmButtonText: tr.applyChange,
    });

    if (!newStatus) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`${API}/admin/companies/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ icon: "success", title: tr.statusUpdated, timer: 1200, showConfirmButton: false });
      fetchCompanies();
      setSelected(null);
    } catch {
      Swal.fire({ icon: "error", title: tr.failedStatus });
    }
  };

  const filtered = companies.filter((c) => {
    const matchSearch = c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === "all" || c.status === filterStatus);
  });

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><Building2 size={22} /></span>
            {tr.companiesDesk}
          </h1>
          <p className="text-foreground/50 mt-1.5 font-medium text-sm">{companies.length} {tr.companiesRegistered}</p>
        </div>
        <button onClick={fetchCompanies} className="self-start flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr.refresh}
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-foreground/40 ${isRTL ? "right-4" : "left-4"}`} />
          <input type="text" placeholder={tr.searchCompany} value={search} onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3.5 text-sm outline-none transition focus:border-[#febc5a] focus:bg-background ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3.5 text-sm outline-none cursor-pointer transition focus:border-[#febc5a] text-foreground">
          <option value="all">{tr.allStatuses}</option>
          <option value="pending">{tr.pending}</option>
          <option value="active">{tr.active}</option>
          <option value="blocked">{tr.blocked}</option>
        </select>
      </motion.div>

      {/* Cards Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[2rem] border border-foreground/5 bg-foreground/[0.03]" />)
          : filtered.length === 0
            ? <div className="col-span-full rounded-[2rem] border border-dashed border-foreground/10 p-16 text-center text-foreground/40 font-medium">{tr.noCompanies}</div>
            : filtered.map((c, i) => (
              <motion.div key={c.id} custom={i} initial="hidden" animate="visible" variants={fadeUp} onClick={() => setSelected(c)}
                className="group cursor-pointer rounded-[2rem] border border-foreground/10 bg-background/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#febc5a]/30 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#febc5a]/20 to-amber-500/5 border border-[#febc5a]/20 flex items-center justify-center text-[#febc5a] font-black text-lg shrink-0">
                    {c.company_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[c.status] ?? "bg-foreground/5 text-foreground/50 border-foreground/10"}`}>{c.status}</span>
                </div>
                <h3 className="font-bold text-foreground text-base tracking-tight truncate">{c.company_name}</h3>
                <p className="text-sm text-foreground/50 mt-0.5 truncate">{c.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/40">
                  {c.industry && <span>{c.industry}</span>}
                  {c.city && <><span>·</span><span>{c.city}</span></>}
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* Detail Slide-Over */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed h-full inset-0 z-[40] bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`fixed top-0 z-50 h-screen w-full max-w-sm sm:max-w-md bg-background border-foreground/10 shadow-2xl overflow-y-auto ${isRTL ? "left-0 border-e" : "right-0 border-s"}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-foreground">{tr.companyProfile}</h2>
                  <button onClick={() => setSelected(null)} className="rounded-xl p-2 text-foreground/50 hover:bg-foreground/10 hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#febc5a] to-amber-600 flex items-center justify-center text-black font-black text-3xl shadow-xl shadow-[#febc5a]/20">
                    {selected.company_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{selected.company_name}</h3>
                    <span className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[selected.status] ?? ""}`}>{selected.status}</span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.02] divide-y divide-foreground/5 overflow-hidden">
                  {[
                    { icon: <Mail size={15} />, label: tr.email, value: selected.email },
                    { icon: <Phone size={15} />, label: tr.phone, value: selected.phone || "—" },
                    { icon: <Building2 size={15} />, label: tr.industry, value: selected.industry || "—" },
                    { icon: <MapPin size={15} />, label: tr.city, value: selected.city || "—" },
                    { icon: <Globe size={15} />, label: tr.website, value: selected.website || "—" },
                    { icon: <Calendar size={15} />, label: tr.joined, value: new Date(selected.created_at).toLocaleDateString() },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4 px-4 py-3.5">
                      <span className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/50 shrink-0">{row.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{row.label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <div className="rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.02] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">{tr.about}</p>
                    <p className="text-sm leading-relaxed text-foreground/70">{selected.description}</p>
                  </div>
                )}

                <button onClick={() => updateStatus(selected.id, selected.status)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#febc5a] py-4 font-bold text-black shadow-md shadow-[#febc5a]/20 transition hover:bg-amber-400 active:scale-[0.98]">
                  <CheckCircle size={18} /> {tr.changeStatus}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
