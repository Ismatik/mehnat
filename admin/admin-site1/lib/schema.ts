// Метаописание всех ресурсов, настроек и структурных блоков страниц.
// Формы и списки рендерятся из этих описаний — один движок на всё,
// «редактируется абсолютно всё содержимое сайта без правок кода».

import { emptyI18n } from "./i18n";

export type FieldType =
  | "i18n" // трилингвал, одна строка
  | "i18n-text" // трилингвал, многострочный
  | "text" // обычная строка
  | "textarea"
  | "image" // URL картинки + загрузка + превью
  | "color" // hex-цвет
  | "int"
  | "bool"
  | "datetime"
  | "gallery" // массив URL картинок
  | "menu-parent" // выбор родительского пункта меню
  | "i18n-list" // массив трилингвал-строк
  | "repeater" // массив объектов (itemSchema)
  | "object" // один вложенный объект (itemSchema)
  | "page-body"; // структурный блок страницы (по slug)

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  itemSchema?: Field[]; // repeater / object
  itemLabel?: string; // подпись элемента списка
  full?: boolean; // на всю ширину сетки
  readOnly?: boolean;
  // required — i18n-поле, обязательное на ВСЕХ языках для публикации
  // (в отличие от прочих, где пусто-везде допускается). Зеркалит RequiredI18n на API.
  required?: boolean;
  // aspect — пропорция рамки кропа (ширина/высота) для image/gallery (по макету).
  aspect?: number;
}

export interface ResourceDef {
  key: string; // имя ресурса в API
  label: string; // пункт меню
  icon: string;
  titleField: string; // поле-заголовок строки в списке
  sortable: boolean; // есть sort_order → drag-сортировка
  publishField?: string; // is_active | published | is_published
  fields: Field[];
  fixed?: boolean; // нельзя создавать/удалять (только редактировать существующие)
  // hidden — скрыт из сайдбара админки (данные/таблица/API НЕ трогаются;
  // убрать флаг — раздел вернётся). services/team скрыты: блоков нет в макете.
  hidden?: boolean;
}

// ---- Структурный detail страны (countries.description) ----
const COUNTRY_DETAIL: Field[] = [
  { name: "code", label: "Код (RU, DE, KR…)", type: "text" },
  { name: "short", label: "Кратко (под названием)", type: "i18n" },
  { name: "tagline", label: "Подзаголовок в шапке детали", type: "i18n" },
  { name: "earnings", label: "Реальный заработок", type: "text" },
  { name: "earnings_note", label: "Пояснение к заработку", type: "i18n-text" },
  { name: "docs", label: "Нужные документы", type: "i18n-text" },
  { name: "steps", label: "Порядок выезда", type: "i18n-list", itemLabel: "Шаг" },
  { name: "note", label: "Предупреждение", type: "i18n-text" },
];

// ---- Ресурсы (порядок = порядок в боковом меню) ----
export const RESOURCES: ResourceDef[] = [
  {
    key: "sliders",
    label: "Слайдер (главная)",
    icon: "🖼️",
    titleField: "title",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "image_url", label: "Фоновое изображение", type: "image", full: true, aspect: 1.5 },
      { name: "title", label: "Заголовок", type: "i18n", full: true },
      { name: "subtitle", label: "Подзаголовок", type: "i18n-text", full: true },
      { name: "cta_label", label: "Текст кнопки", type: "i18n" },
      { name: "cta_url", label: "Ссылка кнопки", type: "text" },
      { name: "title_color", label: "Цвет заголовка", type: "color" },
      { name: "link_url", label: "Ссылка слайда (необязательно)", type: "text" },
    ],
  },
  {
    key: "news",
    label: "Новости",
    icon: "📰",
    titleField: "title",
    sortable: false,
    publishField: "published",
    fields: [
      { name: "slug", label: "Slug (адрес: /novosti/slug)", type: "text", hint: "Латиница, без пробелов" },
      { name: "title", label: "Заголовок", type: "i18n", full: true, required: true },
      { name: "category", label: "Категория (бейдж)", type: "i18n" },
      { name: "published_at", label: "Дата публикации", type: "datetime" },
      { name: "cover_url", label: "Обложка", type: "image", full: true, aspect: 16 / 9 },
      { name: "excerpt", label: "Краткое описание", type: "i18n-text", full: true },
      { name: "body", label: "Текст новости", type: "i18n-text", full: true },
      { name: "gallery", label: "Галерея", type: "gallery", full: true, aspect: 4 / 3 },
    ],
  },
  {
    key: "pages",
    label: "Страницы",
    icon: "📄",
    titleField: "title",
    sortable: false,
    publishField: "is_published",
    fixed: true,
    fields: [
      { name: "slug", label: "Slug", type: "text", readOnly: true },
      { name: "title", label: "Название", type: "i18n", required: true },
      { name: "hero_title", label: "Заголовок баннера", type: "i18n" },
      { name: "hero_subtitle", label: "Подзаголовок баннера", type: "i18n" },
      { name: "hero_image_url", label: "Фон баннера", type: "image", full: true, aspect: 2.4 },
      { name: "hero_title_color", label: "Цвет заголовка баннера", type: "color" },
      { name: "body", label: "Содержимое страницы", type: "page-body", full: true },
    ],
  },
  {
    key: "countries",
    label: "Страны назначения",
    icon: "🌍",
    titleField: "name",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "name", label: "Название страны", type: "i18n", required: true },
      { name: "flag_url", label: "Флаг / изображение", type: "image", aspect: 1 },
      { name: "link_url", label: "Ссылка «Подробнее»", type: "text" },
      { name: "highlighted", label: "Выделенная карточка", type: "bool" },
      { name: "available", label: "Есть страница «Подробнее»", type: "bool" },
      {
        name: "description",
        label: "Детали (мастер-деталь на главной)",
        type: "object",
        itemSchema: COUNTRY_DETAIL,
        full: true,
      },
    ],
  },
  {
    key: "services",
    label: "Услуги",
    icon: "🧩",
    titleField: "title",
    sortable: true,
    publishField: "is_active",
    hidden: true, // блока «Услуги» нет в макете — скрыт (данные/API целы)
    fields: [
      { name: "title", label: "Заголовок", type: "i18n" },
      { name: "icon", label: "Иконка (эмодзи)", type: "text" },
      { name: "description", label: "Описание", type: "i18n-text", full: true },
      { name: "link_url", label: "Ссылка", type: "text" },
    ],
  },
  {
    key: "help_items",
    label: "«Чем поможем»",
    icon: "🤝",
    titleField: "title",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "icon", label: "Иконка (эмодзи)", type: "text" },
      { name: "title", label: "Заголовок", type: "i18n" },
      { name: "description", label: "Описание", type: "i18n-text", full: true },
    ],
  },
  {
    key: "centers",
    label: "Центры / контакты",
    icon: "🏢",
    titleField: "city",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "city", label: "Город", type: "i18n" },
      { name: "address", label: "Адрес", type: "i18n" },
      { name: "phone", label: "Телефон", type: "text" },
      { name: "email", label: "Почта", type: "text" },
      { name: "map_url", label: "Ссылка на карту", type: "text" },
    ],
  },
  {
    key: "team",
    label: "Команда",
    icon: "👤",
    titleField: "full_name",
    sortable: true,
    publishField: "is_active",
    hidden: true, // блока «Команда» нет в макете — скрыт (данные/API целы)
    fields: [
      { name: "full_name", label: "ФИО", type: "i18n" },
      { name: "position", label: "Должность", type: "i18n" },
      { name: "photo_url", label: "Фото", type: "image", full: true, aspect: 4 / 5 },
      { name: "bio", label: "Биография", type: "i18n-text", full: true },
    ],
  },
  {
    key: "menu",
    label: "Меню (шапка)",
    icon: "🧭",
    titleField: "label",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "label", label: "Название пункта", type: "i18n" },
      { name: "url", label: "Ссылка", type: "text" },
      { name: "parent_id", label: "Родительский пункт (для выпадающего)", type: "menu-parent" },
    ],
  },
  {
    key: "footer_links",
    label: "Ссылки футера",
    icon: "🔗",
    titleField: "label",
    sortable: true,
    publishField: "is_active",
    fields: [
      { name: "label", label: "Название", type: "i18n" },
      { name: "url", label: "Ссылка", type: "text" },
      { name: "column_no", label: "Колонка (1–3)", type: "int" },
    ],
  },
];

// ---- Структурные блоки страниц (pages.body) по slug ----
export const PAGE_BODY_SCHEMAS: Record<string, Field[]> = {
  "o-nas": [
    { name: "heading", label: "Заголовок раздела", type: "i18n", full: true },
    { name: "collage", label: "Коллаж фото (4 шт.)", type: "gallery", full: true, aspect: 4 / 3 },
    { name: "goal_title", label: "«Наша цель» — заголовок", type: "i18n" },
    { name: "goal_subtitle", label: "«Наша цель» — подзаголовок", type: "i18n" },
    { name: "goal_text", label: "«Наша цель» — текст", type: "i18n-text", full: true },
    { name: "list1_title", label: "Список 1 — заголовок", type: "i18n", full: true },
    { name: "list1", label: "Список 1 — пункты", type: "i18n-list", itemLabel: "Пункт", full: true },
    { name: "list2_title", label: "Список 2 — заголовок", type: "i18n", full: true },
    { name: "list2", label: "Список 2 — пункты", type: "i18n-list", itemLabel: "Пункт", full: true },
  ],
  "rabota-v-germanii": [
    { name: "intro", label: "Вступление", type: "i18n-text", full: true },
    {
      name: "facts",
      label: "Факты (карточки)",
      type: "repeater",
      itemLabel: "Факт",
      full: true,
      itemSchema: [
        { name: "label", label: "Подпись", type: "i18n" },
        { name: "value", label: "Значение", type: "i18n" },
        { name: "note", label: "Пояснение", type: "i18n" },
      ],
    },
    { name: "help", label: "Чем поможет Центр", type: "i18n-list", itemLabel: "Пункт", full: true },
    { name: "professions", label: "Востребованные профессии", type: "i18n-list", itemLabel: "Профессия", full: true },
    { name: "language_note", label: "Блок «Знание языка»", type: "i18n-text", full: true },
    {
      name: "steps",
      label: "Порядок оформления",
      type: "repeater",
      itemLabel: "Шаг",
      full: true,
      itemSchema: [
        { name: "n", label: "Номер (01, 02…)", type: "text" },
        { name: "title", label: "Заголовок", type: "i18n" },
        { name: "desc", label: "Описание", type: "i18n" },
      ],
    },
    { name: "documents", label: "Необходимые документы", type: "i18n-list", itemLabel: "Документ", full: true },
    { name: "warning_title", label: "Предупреждение — заголовок", type: "i18n", full: true },
    { name: "warning_text", label: "Предупреждение — текст", type: "i18n-text", full: true },
  ],
};

// ---- Настройки сайта (сгруппированы) ----
export interface SettingField {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  aspect?: number; // пропорция кропа для image
}
export interface SettingsGroup {
  title: string;
  icon: string;
  fields: SettingField[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Общие",
    icon: "⚙️",
    fields: [
      { key: "site_title", label: "Название сайта (шапка)", type: "i18n" },
      { key: "site_subtitle", label: "Подпись под названием", type: "i18n" },
      { key: "org_status", label: "Строка в верхней панели", type: "i18n" },
      { key: "logo_url", label: "Логотип", type: "image", aspect: 1 },
      { key: "accent_color", label: "Акцентный цвет сайта", type: "color" },
    ],
  },
  {
    title: "Блок Президента",
    icon: "🏛️",
    fields: [
      { key: "president_photo_url", label: "Фото Президента", type: "image", aspect: 4 / 5 },
      { key: "president_label", label: "Подпись (над фото)", type: "i18n" },
      { key: "president_caption", label: "Текст под фото", type: "i18n" },
      { key: "president_url", label: "Ссылка (president.tj)", type: "text" },
    ],
  },
  {
    title: "Контакты",
    icon: "📞",
    fields: [
      { key: "phone_1", label: "Телефон 1", type: "text" },
      { key: "phone_2", label: "Телефон 2", type: "text" },
      { key: "email", label: "Электронная почта", type: "text" },
      { key: "address", label: "Адрес", type: "i18n" },
    ],
  },
  {
    title: "Соцсети",
    icon: "🌐",
    fields: [
      { key: "facebook_url", label: "Facebook", type: "text" },
      { key: "instagram_url", label: "Instagram", type: "text" },
      { key: "youtube_url", label: "YouTube", type: "text" },
      { key: "telegram_url", label: "Telegram (ссылка)", type: "text" },
      { key: "telegram_handle", label: "Telegram (@имя)", type: "text" },
    ],
  },
  {
    title: "Регистрация и Telegram",
    icon: "📲",
    fields: [
      { key: "ats_url", label: "Ссылка регистрации (ATS)", type: "text" },
      { key: "qr_registration_url", label: "QR регистрации", type: "image", aspect: 1 },
      { key: "register_title", label: "Заголовок блока регистрации", type: "i18n" },
      { key: "register_text", label: "Текст блока регистрации", type: "i18n-text" },
      { key: "telegram_title", label: "Заголовок блока Telegram", type: "i18n" },
      { key: "telegram_text", label: "Текст блока Telegram", type: "i18n-text" },
      { key: "qr_telegram_url", label: "QR Telegram", type: "image", aspect: 1 },
    ],
  },
  {
    title: "Блок предупреждения",
    icon: "⚠️",
    fields: [
      { key: "warning_title", label: "Заголовок", type: "i18n" },
      { key: "warning_text", label: "Текст", type: "i18n-text" },
      { key: "warning_link", label: "Текст ссылки", type: "i18n" },
    ],
  },
  {
    title: "Баннеры и футер",
    icon: "🧱",
    fields: [
      { key: "hero_default_image", label: "Фон баннера по умолчанию", type: "image", aspect: 2.4 },
      { key: "copyright", label: "Копирайт (основной)", type: "i18n" },
      { key: "footer_copyright", label: "Копирайт (нижняя строка)", type: "i18n" },
    ],
  },
];

// ---- Пустое значение поля по типу ----
export function emptyValue(f: Field): any {
  switch (f.type) {
    case "i18n":
    case "i18n-text":
      return emptyI18n();
    case "bool":
      return false;
    case "int":
      return 0;
    case "gallery":
    case "i18n-list":
    case "repeater":
      return [];
    case "object":
      return {};
    case "menu-parent":
      return null;
    case "color":
      return "#0b3b6b";
    default:
      return "";
  }
}

// Пустая запись ресурса для формы создания.
export function newRow(def: ResourceDef): Record<string, any> {
  const row: Record<string, any> = {};
  for (const f of def.fields) row[f.name] = emptyValue(f);
  if (def.publishField) row[def.publishField] = def.publishField === "is_active";
  return row;
}
