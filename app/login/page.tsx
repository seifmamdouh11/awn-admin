"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdmin } from "../Context/AdminContext";
import { useLang } from "../Hooks/LangProvider";
import { useTheme } from "../Hooks/ThemeProvider";
import t from "../translations";
import Swal from "sweetalert2";
import { ShieldCheck, Mail, Lock, Loader2, Globe, Sun, Moon } from "lucide-react";
import { API_URL } from "../utils/api";

export default function LoginPage() {
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, adminRole, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Quick check: If local token exists, redirect immediately to avoid flicker
    if (typeof window !== "undefined" && localStorage.getItem("adminToken") && adminRole) {
      router.push("/");
      return;
    }

    if (!isLoading && adminRole) {
      router.push("/");
    }
  }, [isLoading, adminRole, router]);

  if (isLoading || adminRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#febc5a]" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/admin/login`, {
        username,
        password,
      });

      const { token, admin } = res.data;
      const userRole = admin?.role;

      if (userRole !== "super_admin" && userRole !== "moderator") {
        throw new Error(tr.roleError);
      }

      await Swal.fire({
        icon: "success",
        title: tr.accessGranted,
        text: `${tr.welcomeBack} ${admin?.username || username}`,
        timer: 1500,
        showConfirmButton: false,
        background: "#1A1A1A",
        color: "#FFFFFF",
      });

      login(token, userRole, admin?.username || username);
    } catch (err) {
      console.error(err);
      const e = err as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: "error",
        title: tr.accessDenied,
        text: e.response?.data?.error || tr.invalidCerts,
        background: "#1A1A1A",
        color: "#FFFFFF",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 p-6 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background Blobs */}
      <div className="absolute w-[500px] h-[500px] bg-[#febc5a]/20 rounded-full blur-3xl opacity-50 top-[-10%] left-[-10%] z-0" />
      <div className="absolute w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl opacity-50 bottom-[-20%] right-[-10%] z-0" />

      {/* Controls Overlay */}
      <div className={`absolute top-8 ${isRTL ? "left-8" : "right-8"} z-50 flex items-center gap-3`}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-md text-xs font-black text-foreground hover:bg-foreground/10 transition active:scale-95"
        >
          {theme === "dark" ? <Sun size={14} className="text-[#febc5a]" /> : <Moon size={14} className="text-[#febc5a]" />}
          {theme === "dark" ? (lang === "en" ? "Light" : "فاتح") : (lang === "en" ? "Dark" : "داكن")}
        </button>
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-md text-xs font-black text-foreground hover:bg-foreground/10 transition active:scale-95"
        >
          <Globe size={14} className="text-[#febc5a]" />
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-md bg-background/80 backdrop-blur-xl rounded-[2.5rem] border border-foreground/10 p-10 shadow-2xl z-10">
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 bg-gradient-to-br from-[#febc5a] to-[#d97706] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#febc5a]/20">
            <span className="text-black font-black text-3xl tracking-tighter">A</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{tr.adminSignIn}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={10} />
            {tr.unauthorizedAccess}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ms-2 block">{tr.username}</label>
            <div className="relative">
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/30 ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-2xl bg-foreground/5 border border-foreground/10 p-4 text-sm outline-none transition focus:border-[#febc5a]/50 focus:bg-background shadow-sm ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                placeholder={tr.usernamePlaceholder}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-foreground/40 uppercase tracking-widest ms-2 block">{tr.password}</label>
            <div className="relative">
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/30 ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl bg-foreground/5 border border-foreground/10 p-4 text-sm outline-none transition focus:border-red-500/50 focus:bg-background shadow-sm tracking-[0.2em] ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}`}
                placeholder={tr.passwordPlaceholder}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#febc5a] text-black font-black py-4 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-[#febc5a]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {tr.authenticating}
              </>
            ) : (
              tr.signIn
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
