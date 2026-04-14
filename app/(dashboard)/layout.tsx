"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "../Context/AdminContext";
import { useTheme } from "../Hooks/ThemeProvider";
import { useLang, Lang } from "../Hooks/LangProvider";
import t, { Translations } from "../translations";
import Swal from "sweetalert2";
import {
  Building2,
  Users,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Coins
} from "lucide-react";

interface SidebarContentProps {
  tr: Translations;
  isRTL: boolean;
  pathname: string;
  adminName: string | null;
  setSidebarOpen: (open: boolean) => void;
  NAV_ITEMS: { label: string; path: string; icon: React.ReactNode }[];
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  lang: string;
  theme: string;
  handleLogout: () => void;
}

const SidebarContent = ({
  tr,
  isRTL,
  pathname,
  adminName,
  setSidebarOpen,
  NAV_ITEMS,
  toggleTheme,
  setLang,
  lang,
  theme,
  handleLogout
}: SidebarContentProps) => (
  <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
    {/* Brand */}
    <div className="flex items-center gap-4 mb-10 cursor-default">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#febc5a] to-[#d97706] flex items-center justify-center shadow-lg shadow-[#febc5a]/20 shrink-0">
        <span className="font-black text-black text-xl">A</span>
      </div>
      <div className="min-w-0">
        <h1 className="font-bold text-foreground text-base tracking-tight truncate">{tr.masterAdmin}</h1>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest truncate">{adminName || "Admin"}</p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${isActive
                ? "bg-[#febc5a] text-black shadow-md shadow-[#febc5a]/20"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
              }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>

    {/* Bottom controls */}
    <div className="pt-6 border-t border-foreground/10 space-y-2">
      {/* Theme + Lang */}
      <div className="flex items-center gap-2 px-2 pb-2">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 py-2.5 text-xs font-bold text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          title="Toggle Language"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/5 py-2.5 text-xs font-bold text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
        >
          <Languages size={15} />
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500/80 transition hover:bg-red-500/10 hover:text-red-500"
      >
        <LogOut size={18} />
        {tr.terminateSession}
      </button>
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { adminName, logout, isLoading, adminRole } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tr = t[lang as keyof typeof t];
  const isRTL = lang === "ar";

  useEffect(() => {
    // Delay setting mounted to avoid hydration mismatch AND the strict set-state-in-effect rule
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading && !adminRole) {
      router.push("/login");
    }
  }, [isLoading, adminRole, router]);

  if (isLoading || !mounted || !adminRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#febc5a]/30 border-t-[#febc5a] animate-spin" />
      </div>
    );
  }

  const NAV_ITEMS: { label: string; path: string; icon: React.ReactNode }[] = [
    { label: tr.overviewHub, path: "/", icon: <LayoutDashboard size={20} /> },
    { label: tr.companiesDesk, path: "/companies", icon: <Building2 size={20} /> },
    { label: tr.volunteersDesk, path: "/volunteers", icon: <Users size={20} /> },
    { label: tr.opportunities, path: "/events", icon: <CalendarDays size={20} /> },
    { label: tr.reviewOpportunities, path: "/events/pending", icon: <ShieldCheck size={20} /> },
  ];

  if (adminRole === 'super_admin') {
    NAV_ITEMS.push(
      { label: tr.financeDesk, path: "/finance", icon: <Coins size={20} /> },
      { label: tr.withdrawalsDesk, path: "/withdrawals", icon: <Wallet size={20} /> },
      { label: tr.auditLogs, path: "/audit", icon: <ShieldAlert size={20} /> },
      { label: tr.teamManagement, path: "/moderators", icon: <ShieldCheck size={20} /> }
    );
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: tr.areYouSure,
      text: tr.logoutWarning,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: tr.confirmLogout,
      cancelButtonText: tr.cancel,
      background: theme === "dark" ? "#1A1A1A" : "#FFFFFF",
      color: theme === "dark" ? "#FFFFFF" : "#1A1A1A",
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const sidebarProps = {
    tr,
    isRTL,
    pathname,
    adminName,
    setSidebarOpen,
    NAV_ITEMS,
    toggleTheme,
    setLang,
    lang,
    theme,
    handleLogout
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 flex-col bg-foreground/[0.02] border-e border-foreground/5 p-5 z-20">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER PANEL ── */}
      <aside
        className={`fixed top-0 z-40 h-full w-72 bg-background border-e border-foreground/10 shadow-2xl p-5 flex flex-col transition-transform duration-300 lg:hidden ${isRTL
            ? sidebarOpen ? "right-0 translate-x-0" : "right-0 translate-x-full"
            : sidebarOpen ? "left-0 translate-x-0" : "left-0 -translate-x-full"
          }`}
      >
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-foreground/50 hover:bg-foreground/10 hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between border-b border-foreground/5 bg-background/80 backdrop-blur-sm px-4 py-3 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#febc5a] to-[#d97706] flex items-center justify-center">
              <span className="font-black text-black text-sm">A</span>
            </div>
            <span className="font-bold text-foreground text-sm">{tr.masterAdmin}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="rounded-lg p-2 text-foreground/60 hover:bg-foreground/10 transition">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-lg p-2 text-foreground/60 hover:bg-foreground/10 transition text-xs font-bold">
              {lang === "en" ? "ع" : "EN"}
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute top-0 end-0 w-[600px] h-[600px] bg-[#febc5a]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
