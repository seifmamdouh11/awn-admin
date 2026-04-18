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
  Coins,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Briefcase,
  PieChart
} from "lucide-react";
import { motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "../Context/SidebarContext";

interface SidebarContentProps {
  tr: Translations;
  isRTL: boolean;
  pathname: string;
  adminName: string | null;
  setSidebarOpen: (open: boolean) => void;
  NAV_ITEMS: {
    label: string;
    icon: React.ReactNode;
    items?: { label: string; path: string; icon: React.ReactNode }[];
    path?: string;
  }[];
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  lang: string;
  theme: string;
  handleLogout: () => void;
  forceExpanded?: boolean;
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
  handleLogout,
  forceExpanded = false
}: SidebarContentProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const collapsed = isCollapsed && !forceExpanded;
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    // Auto-expand group if a sub-item is active
    NAV_ITEMS.forEach(group => {
      if (group.items?.some(item => item.path === pathname)) {
        if (!expandedGroups.includes(group.label)) {
          setExpandedGroups(prev => [...prev, group.label]);
        }
      }
    });
  }, [pathname, NAV_ITEMS]);

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Brand */}
      <div className={`flex items-center gap-3 mb-8 cursor-default overflow-hidden ${collapsed && 'justify-center'}`}>
        <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-[#febc5a] to-[#d97706] flex items-center justify-center shadow-lg shadow-[#febc5a]/20">
          <span className="font-black text-black text-xl">A</span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{tr.masterAdmin}</p>
            <p className="text-sm font-black text-white tracking-tight truncate">{adminName || "Admin"}</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-x-hidden custom-scrollbar no-scrollbar pr-2 -mr-2">
        {NAV_ITEMS.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const hasActiveChild = group.items?.some(item => item.path === pathname);

          return (
            <div key={group.label} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => collapsed ? toggleSidebar() : toggleGroup(group.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all relative group/nav ${!collapsed && isExpanded ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  } ${collapsed && 'justify-center px-0 h-12 w-12 mx-auto'} ${hasActiveChild && !isExpanded && !collapsed ? "text-[#febc5a]" : ""}`}
              >
                <div className={`shrink-0 ${hasActiveChild && !isExpanded ? "text-[#febc5a]" : ""}`}>{group.icon}</div>
                {!collapsed && (
                  <>
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 text-left"
                    >
                      {group.label}
                    </motion.span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="opacity-40" />
                    </motion.div>
                  </>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className={`absolute ${isRTL ? 'right-full mr-4' : 'left-full ml-4'} invisible group-hover/nav:visible px-3 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl z-[60] whitespace-nowrap border border-white/10`}>
                    {group.label}
                  </div>
                )}
              </button>

              {/* Sub items */}
              {!collapsed && (
                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0
                  }}
                  className="overflow-hidden"
                >
                  <div className={`mt-1 space-y-1 ${isRTL ? "mr-4 pr-4 border-r" : "ml-4 pl-4 border-l"} border-white/5`}>
                    {group.items?.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${isActive
                            ? "bg-[#febc5a] text-black shadow-lg shadow-[#febc5a]/20 active:scale-95"
                            : "text-white/40 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="pt-6 border-t border-white/10 space-y-2">
        <div className={`flex items-center gap-2 pb-2 ${collapsed ? 'flex-col px-0' : 'px-2'}`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 py-2.5 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white ${collapsed ? 'h-11 w-11' : 'flex-1'}`}
            title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {!collapsed && (theme === "dark" ? "Light" : "Dark")}
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className={`flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 py-2.5 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white ${collapsed ? 'h-11 w-11' : 'flex-1'}`}
            title="Toggle Language"
          >
            <Languages size={14} />
            {!collapsed && (lang === "en" ? "العربية" : "English")}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500/80 transition hover:bg-red-500/10 hover:text-red-500 ${collapsed && 'justify-center px-0'}`}
        >
          <LogOut size={18} />
          {!collapsed && tr.terminateSession}
        </button>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { adminName, logout, isLoading, adminRole } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRTL = lang === "ar";
  const tr = t[lang as keyof typeof t];

  const NAV_ITEMS: SidebarContentProps["NAV_ITEMS"] = [
    {
      label: tr.overviewHub,
      icon: <LayoutDashboard size={20} />,
      items: [
        { label: tr.overviewHub, path: "/", icon: <PieChart size={18} /> },
        { label: tr.companiesDesk, path: "/companies", icon: <Building2 size={18} /> },
        { label: tr.volunteersDesk, path: "/volunteers", icon: <Users size={18} /> },
      ]
    },
    {
      label: tr.opportunities,
      icon: <Briefcase size={20} />,
      items: [
        { label: tr.opportunities, path: "/events", icon: <CalendarDays size={18} /> },
        { label: tr.reviewOpportunities, path: "/events/pending", icon: <ShieldCheck size={18} /> },
      ]
    },
  ];

  if (adminRole === 'super_admin') {
    NAV_ITEMS.push(
      {
        label: tr.financeDesk,
        icon: <Coins size={20} />,
        items: [
          { label: tr.financeDesk, path: "/finance", icon: <Coins size={18} /> },
          { label: tr.subscriptionsDesk, path: "/subscriptions", icon: <CreditCard size={18} /> },
          { label: tr.withdrawalsDesk, path: "/withdrawals", icon: <Wallet size={18} /> },
        ]
      },
      {
        label: tr.auditLogs,
        icon: <Settings size={20} />,
        items: [
          { label: tr.auditLogs, path: "/audit", icon: <ShieldAlert size={18} /> },
          { label: tr.teamManagement, path: "/moderators", icon: <ShieldCheck size={18} /> },
        ]
      }
    );
  }

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

  useEffect(() => {
    if (mounted) {
      const activeNav = NAV_ITEMS.find((item) => item.path === pathname);
      const title = activeNav ? activeNav.label : "Dashboard";
      document.title = `${title} | AWN Admin`;
    }
  }, [pathname, mounted, tr, adminRole]); // adminRole triggers recalculation of NAV_ITEMS

  if (isLoading || !mounted || !adminRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#febc5a]/30 border-t-[#febc5a] animate-spin" />
      </div>
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
      <motion.aside
        dir={isRTL ? "rtl" : "ltr"}
        className={`hidden lg:flex fixed top-0 ${isRTL ? "right-0 border-s" : "left-0 border-e"} z-50 h-screen flex-col bg-[#222222] border-white/5 shadow-2xl ${isCollapsed ? "p-4" : "p-5"}`}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <SidebarContent {...sidebarProps} />

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-[50%] ${isRTL ? '-left-4' : '-right-4'} h-8 w-8 rounded-full bg-[#febc5a] text-black shadow-xl shadow-[#febc5a]/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-[60]`}
        >
          {isCollapsed ? (
            isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
          ) : (
            isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
          )}
        </button>
      </motion.aside>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      {(sidebarOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER PANEL ── */}
      <aside
        className={`fixed top-0 z-50 h-full w-72 bg-[#222222] p-5 flex flex-col transition-transform duration-300 lg:hidden ${isRTL
          ? `right-0 border-l border-white/5 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`
          : `left-0 border-r border-white/5 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          }`}
      >
        <div className="flex items-center justify-end mb-4">
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <SidebarContent {...sidebarProps} forceExpanded={true} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isRTL
        ? isCollapsed ? "lg:mr-20" : "lg:mr-64"
        : isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}>

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
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute top-0 end-0 w-[600px] h-[600px] bg-[#febc5a]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
