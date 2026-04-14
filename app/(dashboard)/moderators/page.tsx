"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Plus, X, Shield, Mail, User, 
  Key, CheckCircle, ShieldCheck, ShieldAlert, AlertTriangle, Loader2 
} from "lucide-react";
import Swal from "sweetalert2";
import { useLang } from "../../Hooks/LangProvider";
import t from "../../translations";
import { API_URL as API } from "../../utils/api";

type Admin = {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "moderator";
  status: string;
  created_at: string;
};

export default function ModeratorsPage() {
  const { lang } = useLang();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API}/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API}/admin/moderators`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({ icon: "success", title: tr.success, text: tr.modCreated, timer: 1500, showConfirmButton: false });
      setShowCreateModal(false);
      setFormData({ username: "", email: "", password: "" });
      fetchAdmins();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      Swal.fire({ icon: "error", title: tr.error, text: err.response?.data?.error || tr.modFailed });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck size={22} />
            </span>
            {tr.teamManagement}
          </h1>
          <p className="text-foreground/50 mt-1.5 font-medium text-sm">{admins.length} {tr.adminsActive}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchAdmins} className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-3 text-sm font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#febc5a] px-6 py-3 text-sm font-black text-black shadow-lg shadow-[#febc5a]/20 transition hover:bg-amber-400 active:scale-95"
          >
            <Plus size={18} /> {tr.createModerator}
          </button>
        </div>
      </motion.div>

      {/* Team Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-[2.5rem] bg-foreground/5" />)
        ) : (
          admins.map((admin) => (
            <motion.div 
              key={admin.id}
              className={`rounded-[2.5rem] border p-6 flex flex-col justify-between transition-all hover:shadow-xl group ${
                admin.role === 'super_admin' 
                  ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20" 
                  : "bg-background/50 border-foreground/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:bg-amber-500/20 group-hover:text-amber-600 transition-colors">
                  {admin.role === 'super_admin' ? <ShieldAlert size={20} /> : <Shield size={20} />}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  admin.role === 'super_admin' ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "bg-foreground/10 text-foreground/60"
                }`}>
                  {admin.role.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold text-foreground tracking-tight">{admin.username}</h3>
                <div className="flex items-center gap-2 text-foreground/40 mt-1 text-sm">
                  <Mail size={13} />
                  <span>{admin.email}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-foreground/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <CheckCircle size={10} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{admin.status}</span>
                </div>
                <span className="text-[10px] font-bold text-foreground/30">{new Date(admin.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }}
              className={`fixed top-0 bottom-0 z-[70] w-full max-w-md bg-background border-foreground/10 px-8 py-10 flex flex-col gap-8 shadow-2xl ${isRTL ? "left-0 border-e" : "right-0 border-s"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">{tr.createModerator}</h2>
                  <p className="text-sm text-foreground/40 font-medium">{tr.moderatorSubtitle}</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/50 hover:bg-foreground/10 transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ms-1">{tr.username}</label>
                  <div className="relative">
                    <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/30 ${isRTL ? "right-4" : "left-4"}`} />
                    <input 
                      required
                      type="text" 
                      placeholder={tr.usernamePlaceholder} 
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-4 text-sm outline-none transition focus:border-amber-500/50 focus:bg-background ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ms-1">{tr.emailAddress}</label>
                  <div className="relative">
                    <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/30 ${isRTL ? "right-4" : "left-4"}`} />
                    <input 
                      required
                      type="email" 
                      placeholder="moderator@awn.org" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-4 text-sm outline-none transition focus:border-amber-500/50 focus:bg-background ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ms-1">{tr.securePassword}</label>
                  <div className="relative">
                    <Key size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/30 ${isRTL ? "right-4" : "left-4"}`} />
                    <input 
                      required
                      type="password" 
                      placeholder={tr.passwordPlaceholder} 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-4 text-sm outline-none transition focus:border-amber-500/50 focus:bg-background ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`} 
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-600/70 leading-relaxed uppercase tracking-widest">
                      {tr.roleNotice}
                    </p>
                  </div>

                  <button 
                    disabled={formLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#febc5a] py-4 text-sm font-black text-black shadow-lg shadow-[#febc5a]/20 transition hover:bg-amber-400 disabled:opacity-50 active:scale-95"
                  >
                    {formLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {formLoading ? tr.creating : tr.createModerator}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
