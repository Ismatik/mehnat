/* ============================================================
   MEHNAT — дизайн-токены, извлечённые из утверждённого макета
   (variant-5-agency, 5 страниц). Единый источник правды для вёрстки
   обоих сайтов и админок. Второй сайт = те же токены, отличается
   только акцентом/логотипом (значения помечены как site-override).
   ============================================================ */

export const tokens = {
  // ---------- Цвета (точно из макета) ----------
  color: {
    primary:        "#0b3b6b", // основной синий (шапка-бордюр, hero, футер, кнопки)
    primaryDark:    "#08305a", // utility bar, темнее
    accent:         "#d52b1e", // красный акцент (подчёркивания, кнопка "Отправить") — SITE-OVERRIDE для сайта 2
    accentHover:    "#bd2417",
    link:           "#1c63d6", // ссылки "Подробнее"
    text:           "#14233a", // базовый текст
    textHead:       "#1b2c44", // заголовки карточек
    textMuted:      "#7286a0", // приглушённый
    textMuted2:     "#8798ad",
    heroOverlayTop: "rgba(8,32,58,.45)",
    heroOverlayBot: "rgba(8,32,58,.70)",
    bannerHint:     "#9fc0e4", // светло-синий текст на hero
    surface:        "#ffffff",
    border:         "#eef2f7",
    borderCard:     "#e6ecf3",
    footerText:     "#9fc0e4",
    badge:          "#5b8def", // бейдж "Новости" на карточке
    check:          "#1c63d6", // галочки в списках (о нас)
    heroTitleAlt:   "#e8912a", // оранжевый заголовок (страница Германии)
  },

  // ---------- Типографика ----------
  font: {
    display: "'PT Serif', serif",        // заголовки
    body:    "'PT Sans', system-ui, sans-serif", // текст
    mono:    "ui-monospace, monospace",  // технические подписи
    googleHref:
      "https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap",
  },
  // Размеры из макета
  type: {
    heroH1:        "46px", // баннер H1 (Германия 44px)
    sectionH2:     "34px",
    pageTitle:     "30px",
    cardTitle:     "16.5px",
    countryTitle:  "19px",
    body:          "14.5px",
    small:         "13px",
    utility:       "13px",
  },

  // ---------- Раскладка ----------
  layout: {
    wrapMax:    "1180px",
    wrapPad:    "40px",   // ↓ до 20px на мобильном
    heroMin:    "420px",
    radiusCard: "14px",
    radiusPill: "30px",   // кнопки-таблетки, крошки
    radiusImg:  "10px",
  },

  // ---------- Тени ----------
  shadow: {
    card:     "0 4px 18px rgba(11,59,107,.07)",
    cardHover:"0 14px 34px rgba(11,59,107,.15)",
    feedback: "0 14px 40px rgba(11,59,107,.18)",
  },

  // ---------- Брейкпоинты (из media-queries макета) ----------
  breakpoint: { md: "980px", sm: "720px" },
};

/* Повторяющиеся блоки-шаблоны (одинаковы на всех 5 страницах):
   - utilityBar : "Государственное учреждение · Республика Таджикистан" + Facebook + RU/ТҶ/EN
   - masthead   : logo + название (2 строки) + nav + флаг-переключатель + кнопка "Зарегистрируйтесь в Центре"
   - navItems   : О Центре(index) · Новости · О нас · Страна назначения ▾ · Контакты
   - heroBanner : фон-фото + оверлей + H1 + хлебные крошки (Асосӣ » <страница>)
   - feedback   : левое фото + правая синяя форма "Связаться с нами" (Имя/Почта/Сообщение + Отправить),
                  состояние "Спасибо за обращение!" после отправки
   - footer     : "Контакты" pill + соцсети (f/◉/▶) + телефоны 225-05-75 | 225-02-21 + копирайт
   Всё это выносится в общие компоненты Header/Hero/FeedbackForm/Footer и наполняется из settings/menu. */

/* ГЛАВНАЯ (design/mockup/index.html) — секции сверху вниз:
   1. hero: слайдер (слева, 3 слайда с оверлей-заголовком + CTA-кнопкой) +
      статичное фото Президента справа (settings: president_photo_url).
      Слайды → таблица sliders (title, subtitle, cta_label, cta_url, title_color).
   2. news — последние новости (3), из news.
   3. countries master-detail — «Куда можно поехать»: список стран слева,
      детали справа. Из countries (наполняется в админке).
   4. help — «Чем мы вам поможем»: карточки иконка+заголовок+текст, из help_items.
   5. warning — «Никому не платите за наши услуги» (антимошеннический блок),
      текст из settings (warning_title, warning_text, warning_link).
   6. registration + telegram — два QR: регистрация в Центре (ATS) и Telegram.
      settings: ats_url, qr_registration_url, telegram_url, qr_telegram_url.
   7. contacts CTA — «Свяжитесь с нами» + телефоны (settings), ссылка на адреса.
   8. footer. */
