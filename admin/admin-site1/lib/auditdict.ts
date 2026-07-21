// Словари для человекочитаемого журнала аудита. ЕДИНЫЙ файл для правки.
// Неизвестный ключ/раздел/действие — показываем как есть (fallback), не падаем.

// ---- Разделы → названия ----
export const RESOURCE_LABEL: Record<string, string> = {
  settings: "Настройки",
  sliders: "Слайдеры",
  news: "Новости",
  pages: "Страницы",
  countries: "Страны назначения",
  help_items: "«Чем поможем»",
  centers: "Центры",
  team: "Команда",
  menu: "Меню",
  footer_links: "Футер",
  services: "Услуги",
  users: "Пользователи",
  contact_messages: "Заявки",
  upload: "Файлы",
};

// Раздел в винительном падеже (для фразы «создал новость»)
export const RESOURCE_ONE: Record<string, string> = {
  sliders: "слайдер",
  news: "новость",
  pages: "страницу",
  countries: "страну",
  help_items: "пункт «Чем поможем»",
  centers: "центр",
  team: "сотрудника",
  menu: "пункт меню",
  footer_links: "ссылку футера",
  services: "услугу",
  settings: "настройку",
  users: "пользователя",
  contact_messages: "заявку",
};

// ---- Ключи полей → названия ----
export const FIELD_LABEL: Record<string, string> = {
  // settings
  accent_color: "Акцентный цвет",
  logo_url: "Логотип",
  site_title: "Название сайта",
  site_subtitle: "Подпись под названием",
  org_status: "Строка гос-панели",
  president_photo_url: "Фото Президента",
  president_label: "Подпись Президента",
  president_caption: "Текст под фото Президента",
  president_url: "Ссылка Президента",
  phone_1: "Телефон 1",
  phone_2: "Телефон 2",
  email: "Электронная почта",
  address: "Адрес",
  facebook_url: "Facebook",
  instagram_url: "Instagram",
  youtube_url: "YouTube",
  telegram_url: "Telegram",
  telegram_handle: "Telegram-аккаунт",
  ats_url: "Ссылка регистрации (ATS)",
  qr_registration_url: "QR регистрации",
  qr_telegram_url: "QR Telegram",
  register_title: "Заголовок блока регистрации",
  register_text: "Текст блока регистрации",
  telegram_title: "Заголовок блока Telegram",
  telegram_text: "Текст блока Telegram",
  warning_title: "Предупреждение — заголовок",
  warning_text: "Предупреждение — текст",
  warning_link: "Предупреждение — ссылка",
  copyright: "Копирайт",
  footer_copyright: "Копирайт (нижняя строка)",
  hero_default_image: "Фон баннера по умолчанию",
  // общие колонки ресурсов
  title: "Заголовок",
  name: "Название",
  subtitle: "Подзаголовок",
  description: "Описание",
  image_url: "Изображение",
  cover_url: "Обложка",
  flag_url: "Флаг / изображение",
  photo_url: "Фото",
  is_active: "Публикация",
  published: "Публикация",
  is_published: "Публикация",
  sort_order: "Порядок",
  link_url: "Ссылка",
  cta_label: "Текст кнопки",
  cta_url: "Ссылка кнопки",
  slug: "Адрес (slug)",
  body: "Содержимое",
  excerpt: "Краткое описание",
  category: "Категория",
  icon: "Иконка",
  label: "Название",
  url: "Ссылка",
  column_no: "Колонка",
  city: "Город",
  phone: "Телефон",
  map_url: "Карта",
  position: "Должность",
  bio: "Биография",
  full_name: "ФИО",
  role: "Роль",
  site_access: "Доступ к сайтам",
  hero_title: "Заголовок баннера",
  hero_subtitle: "Подзаголовок баннера",
  hero_image_url: "Фон баннера",
  hero_title_color: "Цвет заголовка баннера",
  title_color: "Цвет заголовка",
  highlighted: "Выделенная",
  available: "Есть страница",
  published_at: "Дата публикации",
  file: "Файл",
  is_read: "Прочитано",
};

// ---- Действия → слова ----
export const ACTION_WORD: Record<string, string> = {
  create: "создал",
  update: "изменил",
  delete: "удалил",
  publish: "опубликовал",
  unpublish: "снял с публикации",
  login: "вошёл",
  login_failed: "неудачный вход",
  logout: "вышел",
  user_create: "создал пользователя",
  user_update: "изменил пользователя",
  user_delete: "удалил пользователя",
  upload: "загрузил файл",
};

export const SITE_LABEL: Record<string, string> = { s1: "Сайт 1", s2: "Сайт 2" };

// Причины неудачного входа (page_label с бэка на англ.)
export const LOGIN_REASON: Record<string, string> = {
  "wrong password": "неверный пароль",
  "no such user": "нет такого пользователя",
  "account disabled": "учётная запись отключена",
};

// Цвета словом (образец рисуется в UI по hex)
export const COLOR_NAME: Record<string, string> = {
  "#d52b1e": "красный",
  "#0e7a5e": "зелёный",
  "#127a3e": "зелёный",
  "#0b3b6b": "синий",
  "#e8912a": "оранжевый",
  "#ffffff": "белый",
};

export const PUBLISH_FIELDS = ["is_active", "published", "is_published"];

export function fieldLabel(k: string): string {
  return FIELD_LABEL[k] || k;
}
export function resourceLabel(k: string): string {
  return RESOURCE_LABEL[k] || k;
}
export function isColorField(k: string): boolean {
  return /color/i.test(k);
}
export function isHex(v: any): boolean {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v);
}
export function colorName(hex: string): string {
  return COLOR_NAME[String(hex).toLowerCase()] || hex;
}

// Читаемое значение поля (публикация/доступ/цвет/i18n/строка).
export function fmtValue(field: string, v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  if (field === "is_read") return v === true ? "прочитано" : v === false ? "не прочитано" : String(v);
  if (PUBLISH_FIELDS.includes(field)) return v === true ? "опубликовано" : v === false ? "черновик" : String(v);
  if (field === "site_access" && Array.isArray(v)) return v.map((s) => SITE_LABEL[s] || s).join(", ") || "нет";
  if (isColorField(field) && isHex(v)) {
    const n = COLOR_NAME[String(v).toLowerCase()];
    return n ? `${n} (${v})` : String(v);
  }
  if (typeof v === "object") {
    if (Array.isArray(v)) return v.map((x) => (typeof x === "object" ? x?.ru ?? JSON.stringify(x) : String(x))).join(", ");
    if (typeof v.ru === "string") return v.ru || "—";
    return JSON.stringify(v);
  }
  return String(v);
}

type Row = Record<string, any>;

// Человекочитаемая ФРАЗА строки лога: [кто] [действие] [что, с названием].
export function phrase(row: Row): string {
  const who = row.actor_email || "—";
  const act = ACTION_WORD[row.action] || row.action;
  const diff: Row = row.diff || {};
  const keys = Object.keys(diff);

  switch (row.action) {
    case "login":
      return `${who} вошёл`;
    case "logout":
      return `${who} вышел`;
    case "login_failed":
      return `${who}: неудачный вход (${LOGIN_REASON[row.page_label] || row.page_label || "—"})`;
    case "upload":
      return `${who} загрузил файл${row.page_label ? ` «${row.page_label}»` : ""}`;
    case "user_create":
    case "user_update":
    case "user_delete": {
      let s = `${who} ${act}${row.page_label ? ` ${row.page_label}` : ""}`;
      const role = diff.role?.new;
      const access = diff.site_access?.new;
      if (role || access) {
        const parts: string[] = [];
        if (role) parts.push(`роль ${role}`);
        if (Array.isArray(access)) parts.push(`доступ: ${access.map((x: string) => SITE_LABEL[x] || x).join(", ") || "нет"}`);
        s += ` (${parts.join(", ")})`;
      }
      return s;
    }
  }

  // настройки: одна пара ключ→значение
  if (row.resource === "settings" && keys.length === 1) {
    const k = keys[0];
    return `${who} изменил «${fieldLabel(k)}»: ${fmtValue(k, diff[k].old)} → ${fmtValue(k, diff[k].new)}`;
  }

  const one = RESOURCE_ONE[row.resource] || resourceLabel(row.resource);
  const name = row.page_label ? ` «${row.page_label}»` : "";
  if (row.action === "publish") return `${who} опубликовал ${one}${name}`;
  if (row.action === "unpublish") return `${who} снял с публикации ${one}${name}`;
  if (row.action === "create") return `${who} создал ${one}${name}`;
  if (row.action === "delete") return `${who} удалил ${one}${name}`;
  if (row.action === "update") {
    const changed = keys.filter((k) => !PUBLISH_FIELDS.includes(k)).map(fieldLabel);
    const tail = changed.length ? ` (${changed.slice(0, 3).join(", ")}${changed.length > 3 ? "…" : ""})` : "";
    return `${who} изменил ${one}${name}${tail}`;
  }
  return `${who} ${act} ${one}${name}`;
}
