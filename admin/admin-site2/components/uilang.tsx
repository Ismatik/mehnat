"use client";

// Язык ИНТЕРФЕЙСА админки (отдельно от языка редактируемого контента).
// Дефолт — по языку браузера (navigator.language), сохраняется в localStorage.

import { createContext, useContext, useEffect, useState } from "react";
import { type UiLang, tr as trBase, errText as errBase } from "../lib/messages";

const LS = "mehnat_ui_lang";

function detect(): UiLang {
  if (typeof navigator !== "undefined" && navigator.language) {
    const l = navigator.language.slice(0, 2).toLowerCase();
    if (l === "tg") return "tg";
    if (l === "en") return "en";
    if (l === "ru") return "ru";
  }
  return "ru";
}

const Ctx = createContext<{ lang: UiLang; setLang: (l: UiLang) => void }>({ lang: "ru", setLang: () => {} });
export const useUiLang = () => useContext(Ctx);

export function UiLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("ru");
  useEffect(() => {
    const saved = window.localStorage.getItem(LS) as UiLang | null;
    setLangState(saved === "ru" || saved === "tg" || saved === "en" ? saved : detect());
  }, []);
  function setLang(l: UiLang) {
    setLangState(l);
    try {
      window.localStorage.setItem(LS, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

// Хук-помощники: t(key) и et(error) на текущем языке интерфейса.
export function useT() {
  const { lang } = useUiLang();
  return {
    lang,
    t: (key: string) => trBase(key, lang),
    et: (err: any) => errBase(err, lang),
  };
}
