"use client";

// Провайдеры: текущий язык (с сохранением в localStorage) и данные сайта
// (settings + menu), загружаемые один раз и общие для всех страниц/компонентов.

import { createContext, useContext, useEffect, useState } from "react";
import { pick, type Lang } from "../lib/i18n";
import { getSettings, listResource, SITE_KEY, type Row } from "../lib/api";

const LS_KEY = `mehnat_lang_${SITE_KEY}`;
// Домен сайта (для title вкладки — различимо между s1/s2).
const DOMAIN = SITE_KEY === "s2" ? "a-khorijakor.tj" : "mmashvarat.tj";

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const LangCtx = createContext<LangState>({ lang: "ru", setLang: () => {} });
export const useLang = () => useContext(LangCtx);

interface SiteData {
  settings: Record<string, any>;
  menu: Row[];
  ready: boolean;
}
const SiteCtx = createContext<SiteData>({ settings: {}, menu: [], ready: false });
export const useSiteData = () => useContext(SiteCtx);

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const [data, setData] = useState<SiteData>({ settings: {}, menu: [], ready: false });

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_KEY) as Lang | null;
    if (saved === "ru" || saved === "tg" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      window.localStorage.setItem(LS_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }

  useEffect(() => {
    Promise.all([
      getSettings().catch(() => ({}) as Record<string, any>),
      listResource("menu").catch(() => [] as Row[]),
    ]).then(
      ([settings, menu]) => {
        setData({ settings: settings || {}, menu: menu || [], ready: true });
        // акцент сайта (site-override): проставляем CSS-переменную --accent
        const accent = settings && typeof settings.accent_color === "string" ? settings.accent_color : "";
        if (accent) document.documentElement.style.setProperty("--accent", accent);
      }
    );
  }, []);

  // title вкладки: реальное название сайта (из settings) + домен — различимо между s1/s2.
  useEffect(() => {
    if (!data.ready) return;
    const name = pick(data.settings.site_title, lang);
    document.title = (name ? name + " · " : "") + DOMAIN;
  }, [data, lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <SiteCtx.Provider value={data}>{children}</SiteCtx.Provider>
    </LangCtx.Provider>
  );
}
