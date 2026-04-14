"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type AdminContextType = {
  adminRole: string | null;
  adminName: string | null;
  login: (token: string, role: string, username: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fn = async () => {
      const token = localStorage.getItem("adminToken");
      const localRole = localStorage.getItem("adminRole");
      const localName = localStorage.getItem("adminName");

      if (!token) {
        setAdminRole(null);
        setIsLoading(false);
        return;
      }

      // Optimistically set UI state so it doesn't flicker while checking
      if (localRole === "super_admin" || localRole === "moderator") {
        setAdminRole(localRole);
        setAdminName(localName || "Admin");
      }

      try {
        const { default: api } = await import("../utils/api");
        const res = await api.get("/admin/me");
        
        const adminData = res.data.admin;
        setAdminRole(adminData.role);
        setAdminName(adminData.username);
        // Refresh local storage just in case details changed
        localStorage.setItem("adminRole", adminData.role);
        localStorage.setItem("adminName", adminData.username);

      } catch (err) {
        console.error("Token invalid or expired", err);
        const e = err as { response?: { status?: number } };
        // If it's a 500 error, maybe don't clear the session immediately? 
        // But usually a 500 on /me means something is wrong with the session/user anyway.
        if (e.response?.status !== 500) {
           localStorage.removeItem("adminToken");
           localStorage.removeItem("adminRole");
           localStorage.removeItem("adminName");
           setAdminRole(null);
           setAdminName(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, []); // Only run once on mount

  const login = (token: string, role: string, username: string) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminRole", role);
    localStorage.setItem("adminName", username);
    setAdminRole(role);
    setAdminName(username);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
    setAdminRole(null);
    setAdminName(null);
    router.push("/login");
  };

  return (
    <AdminContext.Provider value={{ adminRole, adminName, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
