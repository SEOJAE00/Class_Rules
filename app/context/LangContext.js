"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LangContext = createContext(null);

export function LangProvider({ children }) {

  const [lang, setLang] = useState(null);

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("lang");
    if (stored === "en" || stored === "ko") {
      setLang(stored);
    } else {
      // 없으면 기본 'en'으로 설정
      window.localStorage.setItem("lang", "en");
      setLang("en");
    }
  }, []);

  const toggleLang = () => {
    // 안전 체크
    const newLang = lang === "en" ? "ko" : "en";
    setLang(newLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", newLang);
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
