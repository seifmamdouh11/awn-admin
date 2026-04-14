"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";
type LangContextType = { lang: Lang; setLang: (l: Lang) => void };

const LangContext = createContext<LangContextType | undefined>(undefined);

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as Lang | null;
    if (saved === "en" || saved === "ar") {
      // Use a microtask/timeout to satisfy the strict lint rule about synchronous state updates in effects
      setTimeout(() => {
        setLangState((prev) => (prev !== saved ? saved : prev));
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = saved;
      }, 0);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("admin_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be inside LangProvider");
  return ctx;
}
