"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Search, RefreshCw, Trash2, Clock, MapPin, Building2, X, Tag } from "lucide-react";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import { API_URL as API } from "../../utils/api";

type Event = {
  id: number;
  title: string;
  company_name: string;
  status: string;
  event_type: string;
  location?: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  is_deleted: number;
  max_volunteers?: number;
};

const STATUS_STYLES: Record<string, string> = {
  open:      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  closed:    "bg-foreground/5 text-foreground/50 border-foreground/10",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  draft:     "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }),
};

export default function EventsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/all-events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const deleteEvent = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: tr.deleteConfirmTitle,
      html: `${tr.deleteConfirmText} <strong>"${title}"</strong>.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: tr.deleteConfirmBtn,
    });

    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API}/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ icon: "success", title: tr.eventRemoved, timer: 1200, showConfirmButton: false });
      setSelected(null);
      fetchEvents();
    } catch {
      Swal.fire({ icon: "error", title: tr.failedDelete });
    }
  };

  const filtered = events.filter((e) => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || e.company_name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === "all" || e.status === filterStatus) && !e.is_deleted;
  });

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0"><CalendarDays size={22} /></span>
            {tr.opportunities}
          </h1>
          <p className="text-foreground/50 mt-1.5 font-medium text-sm">{events.filter((e) => !e.is_deleted).length} {tr.activeEvents}</p>
        </div>
        <button onClick={fetchEvents} className="self-start flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr.refresh}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-foreground/40 ${isRTL ? "right-4" : "left-4"}`} />
          <input type="text" placeholder={tr.searchEvent} value={search} onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3.5 text-sm outline-none transition focus:border-[#febc5a] focus:bg-background ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl border border-foreground/10 bg-foreground/5 px-4 py-3.5 text-sm outline-none cursor-pointer focus:border-[#febc5a] text-foreground">
          <option value="all">{tr.allStatuses}</option>
          <option value="open">{tr.open}</option>
          <option value="draft">{tr.draft}</option>
          <option value="closed">{tr.closed}</option>
          <option value="completed">{tr.completed}</option>
          <option value="cancelled">{tr.cancelled}</option>
        </select>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-[2rem] border border-foreground/5 bg-foreground/[0.03]" />)
          : filtered.length === 0
            ? <div className="col-span-full rounded-[2rem] border border-dashed border-foreground/10 p-16 text-center text-foreground/40 font-medium">{tr.noEvents}</div>
            : filtered.map((e, i) => (
              <motion.div key={e.id} custom={i} initial="hidden" animate="visible" variants={fadeUp} onClick={() => setSelected(e)}
                className="group cursor-pointer rounded-[2rem] border border-foreground/10 bg-background/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-500/20 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-500 capitalize">{e.event_type || "General"}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[e.status] ?? "bg-foreground/5 text-foreground/50 border-foreground/10"}`}>{e.status}</span>
                </div>
                <h3 className="font-bold text-foreground text-base tracking-tight line-clamp-2 mb-1">{e.title}</h3>
                <p className="text-xs text-foreground/50 font-medium">{e.company_name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/40">
                  <Clock size={11} /><span>{new Date(e.start_time).toLocaleDateString()}</span>
                  {e.location && <><span>·</span><MapPin size={11} /><span className="truncate">{e.location}</span></>}
                </div>
              </motion.div>
            ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed h-full inset-0 z-[40] bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`fixed top-0 z-50 h-screen w-full max-w-sm sm:max-w-md bg-background shadow-2xl overflow-y-auto ${isRTL ? "left-0 border-e border-foreground/10" : "right-0 border-s border-foreground/10"}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-foreground">{tr.opportunityDetails}</h2>
                  <button onClick={() => setSelected(null)} className="rounded-xl p-2 text-foreground/50 hover:bg-foreground/10 hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="rounded-[1.5rem] border border-purple-500/20 bg-purple-500/5 p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[selected.status] ?? ""}`}>{selected.status}</span>
                    <span className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 px-3 py-0.5 text-xs font-bold capitalize">{selected.event_type || "General"}</span>
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
                    { icon: <CalendarDays size={15} />, label: tr.posted, value: new Date(selected.created_at).toLocaleDateString() },
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">{tr.description}</p>
                    <p className="text-sm leading-relaxed text-foreground/70">{selected.description}</p>
                  </div>
                )}

                <button onClick={() => deleteEvent(selected.id, selected.title)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 py-4 font-bold text-red-500 transition hover:bg-red-500 hover:text-white active:scale-[0.98]">
                  <Trash2 size={18} /> {tr.forceRemove}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
