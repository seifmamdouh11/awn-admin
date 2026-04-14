"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw, Search, Calendar, User } from "lucide-react";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import { API_URL as API } from "../../utils/api";


type AuditLog = {
  id: number;
  admin_id: number;
  username: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: string;
  created_at: string;
};

export default function AuditLogsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) =>
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <ShieldAlert size={22} />
            </span>
            {tr.auditLogs}
          </h1>
          <p className="text-foreground/50 mt-1.5 font-medium text-sm">{tr.auditDescription}</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr.refresh}
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
        <Search size={15} className={`absolute top-1/2 -translate-y-1/2 text-foreground/40 ${isRTL ? "right-4" : "left-4"}`} />
        <input
          type="text"
          placeholder={tr.searchLogs}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-4 text-sm outline-none transition focus:border-red-500/50 focus:bg-background ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
        />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-[2.5rem] border border-foreground/10 bg-background/50 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse" dir={isRTL ? "rtl" : "ltr"}>
            <thead>
              <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-foreground/40">{tr.admin}</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-foreground/40">{tr.action}</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-foreground/40">{tr.target}</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-foreground/40">{tr.details}</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-foreground/40">{tr.date}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-6"><div className="h-4 w-24 bg-foreground/5 rounded-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-foreground/30 font-bold">No logs found matching your filters.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-foreground/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-foreground text-sm">{log.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground/60 text-[10px] font-black uppercase tracking-widest border border-foreground/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground capitalize">{log.target_type}</span>
                        <span className="text-[10px] text-foreground/40 mt-1 font-mono">{log.target_id || "Global"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm text-foreground/60 max-w-xs truncate group-hover:whitespace-normal group-hover:line-clamp-none transition-all duration-300">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-foreground/40">
                        <Calendar size={13} />
                        <span className="text-xs font-semibold">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
