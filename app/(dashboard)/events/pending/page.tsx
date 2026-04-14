"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Search, RefreshCw, CheckCircle2, XCircle, Clock, MapPin, Building2, X, Tag, FileText } from "lucide-react";
import { useLang } from "../../../Hooks/LangProvider";
import t from "../../../translations";
import { API_URL as API } from "../../../utils/api";

type Event = {
  id: number;
  title: string;
  company_name: string;
  event_type: string;
  location?: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  max_volunteers?: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }),
};

export default function PendingEventsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Event | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/pending-events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (id: number, status: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(`${API}/admin/events/${id}/review`, {
        approval_status: status,
        admin_notes: adminNotes
      }, { headers: { Authorization: `Bearer ${token}` } });

      Swal.fire({
        icon: "success",
        title: tr.reviewSuccess,
        text: status === 'approved' ? tr.eventApproved : tr.eventRejected,
        timer: 2000,
        showConfirmButton: false
      });

      setSelected(null);
      setAdminNotes("");
      fetchPending();
    } catch (err) {
      console.error(err);
      const e = err as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e.response?.data?.error || "Failed to submit review"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = events.filter((e) => {
    const term = search.toLowerCase();
    return e.title?.toLowerCase().includes(term) || e.company_name?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-[#febc5a]/10 border border-[#febc5a]/20 flex items-center justify-center text-[#febc5a] shrink-0">
              <ShieldCheck size={22} />
            </span>
            {tr.reviewTitle}
          </h1>
          <p className="text-foreground/50 mt-1.5 font-medium text-sm">
            {events.length} {tr.pendingReview}
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="self-start flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr.refresh}
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-foreground/40 ${isRTL ? "right-4" : "left-4"}`} />
          <input
            type="text"
            placeholder={tr.searchEvent}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3.5 text-sm outline-none transition focus:border-[#febc5a] focus:bg-background ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
          />
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-[2rem] border border-foreground/5 bg-foreground/[0.03]" />)
          : filtered.length === 0
            ? (
              <div className="col-span-full rounded-[2rem] border border-dashed border-foreground/10 p-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/20 mb-4">
                   <ShieldCheck size={32} />
                </div>
                <p className="text-foreground/40 font-medium">{tr.noPendingEvents}</p>
              </div>
            )
            : filtered.map((e, i) => (
              <motion.div
                key={e.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                onClick={() => setSelected(e)}
                className="group cursor-pointer rounded-[2rem] border border-foreground/10 bg-background/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#febc5a]/30 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="rounded-xl bg-[#febc5a]/10 border border-[#febc5a]/20 px-2.5 py-0.5 text-xs font-bold text-[#febc5a] capitalize">
                    {e.event_type || "General"}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#febc5a] animate-pulse shadow-[0_0_8px_#febc5a]" />
                </div>
                <h3 className="font-bold text-foreground text-base tracking-tight line-clamp-2 mb-1">{e.title}</h3>
                <p className="text-xs text-foreground/50 font-medium">{e.company_name}</p>
                
                <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs text-foreground/40">
                      <Clock size={12} />
                      <span>{new Date(e.created_at).toLocaleDateString()}</span>
                   </div>
                   <span className="text-[10px] font-bold text-[#febc5a] uppercase tracking-wider">{tr.viewDetails}</span>
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* Review Side Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed h-full inset-0 z-[40] bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`fixed top-0 z-50 h-screen w-full max-w-sm sm:max-w-md bg-background shadow-2xl overflow-y-auto ${isRTL ? "left-0 border-e border-foreground/10" : "right-0 border-s border-foreground/10"}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="p-6 sm:p-8 space-y-6 pb-32">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-foreground">{tr.opportunityDetails}</h2>
                  <button onClick={() => setSelected(null)} className="rounded-xl p-2 text-foreground/50 hover:bg-foreground/10 hover:text-foreground">
                    <X size={20} />
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-[#febc5a]/20 bg-[#febc5a]/5 p-5">
                  <div className="flex items-center gap-2 mb-3 font-bold text-[#febc5a] text-xs uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    {tr.pendingReview}
                  </div>
                  <h3 className="text-lg font-black text-foreground">{selected.title}</h3>
                </div>

                <div className="rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.02] divide-y divide-foreground/5 overflow-hidden">
                  {[
                    { icon: <Building2 size={15} />, label: tr.company, value: selected.company_name },
                    { icon: <MapPin size={15} />, label: tr.location, value: selected.location || "—" },
                    { icon: <Clock size={15} />, label: tr.start, value: new Date(selected.start_time).toLocaleString() },
                    { icon: <Clock size={15} />, label: tr.end, value: new Date(selected.end_time).toLocaleString() },
                    { icon: <Tag size={15} />, label: tr.maxVolunteers, value: selected.max_volunteers ? `${selected.max_volunteers} ${tr.spots}` : "—" },
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
                    <div className="flex items-center gap-2 mb-2 text-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                       <FileText size={12} />
                       {tr.description}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}

                {/* Decision UI */}
                <div className="space-y-4 pt-4 border-t border-foreground/10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-1">{tr.adminNotesPlaceholder.split('(')[0]}</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={tr.adminNotesPlaceholder}
                        className="w-full h-32 rounded-[1.5rem] border border-foreground/10 bg-foreground/5 p-4 text-sm outline-none transition focus:border-[#febc5a] focus:bg-background resize-none"
                      />
                   </div>

                   <div className="flex gap-3">
                      <button
                        disabled={submitting}
                        onClick={() => handleReview(selected.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 py-4 font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        <XCircle size={18} /> {tr.reject}
                      </button>
                      <button
                        disabled={submitting}
                        onClick={() => handleReview(selected.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 py-4 font-bold text-emerald-500 transition hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                      >
                        <CheckCircle2 size={18} /> {tr.approve}
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
