// Локализация интерфейса и системных сообщений админки (ru/tg/en).
// Ошибки API приходят с кодом (error) — маппим код на локализованный текст.

export type UiLang = "ru" | "tg" | "en";
export const UI_LANGS: { code: UiLang; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "tg", label: "Тоҷикӣ" },
  { code: "en", label: "English" },
];

type Tri = Record<UiLang, string>;

export const MSG: Record<string, Tri> = {
  // ---- ошибки API (по коду) ----
  invalid_credentials: { ru: "Неверная почта или пароль", tg: "Почта ё гузарвожа нодуруст", en: "Invalid email or password" },
  account_disabled: { ru: "Учётная запись отключена. Обратитесь к администратору.", tg: "Ҳисоб ғайрифаъол аст. Ба маъмур муроҷиат кунед.", en: "Account is disabled. Contact the administrator." },
  credentials_required: { ru: "Введите почту и пароль", tg: "Почта ва гузарвожаро ворид кунед", en: "Enter email and password" },
  session_expired: { ru: "Сессия истекла — войдите снова", tg: "Сессия ба охир расид — аз нав ворид шавед", en: "Session expired — please log in again" },
  too_many_attempts: { ru: "Слишком много неудачных попыток. Попробуйте позже.", tg: "Кӯшишҳои нодуруст хеле зиёданд. Баъдтар кӯшиш кунед.", en: "Too many failed attempts. Please try again later." },
  unauthorized: { ru: "Требуется вход", tg: "Вуруд лозим аст", en: "Login required" },
  forbidden_role: { ru: "Недостаточно прав", tg: "Ҳуқуқ нокифоя", en: "Insufficient permissions" },
  no_site_access: { ru: "Нет доступа к этому сайту", tg: "Ба ин сомона дастрасӣ нест", en: "No access to this site" },
  site_required: { ru: "Выберите хотя бы один сайт", tg: "Ҳадди ақал як сомонаро интихоб кунед", en: "Select at least one site" },
  invalid_role: { ru: "Недопустимая роль", tg: "Нақши нодуруст", en: "Invalid role" },
  email_exists: { ru: "Пользователь с такой почтой уже существует", tg: "Корбар бо ин почта аллакай мавҷуд аст", en: "A user with this email already exists" },
  translation_incomplete: { ru: "Нельзя опубликовать: заполните перевод на всех языках", tg: "Нашр имконнопазир: тарҷумаро ба ҳама забонҳо пур кунед", en: "Cannot publish: fill in the translation in all languages" },
  network: { ru: "Нет связи с сервером", tg: "Алоқа бо сервер нест", en: "No connection to the server" },
  generic: { ru: "Произошла ошибка", tg: "Хатогӣ рӯй дод", en: "An error occurred" },

  // ---- экран входа ----
  login_title: { ru: "Панель управления контентом", tg: "Панели идоракунии мундариҷа", en: "Content management panel" },
  email: { ru: "Электронная почта", tg: "Почтаи электронӣ", en: "Email" },
  password: { ru: "Пароль", tg: "Гузарвожа", en: "Password" },
  sign_in: { ru: "Войти", tg: "Ворид шудан", en: "Sign in" },
  signing_in: { ru: "Вход…", tg: "Вуруд…", en: "Signing in…" },
  logout: { ru: "Выйти", tg: "Баромадан", en: "Log out" },
  no_access_site: { ru: "У вашей учётной записи нет доступа к этому сайту.", tg: "Ҳисоби шумо ба ин сомона дастрасӣ надорад.", en: "Your account has no access to this site." },
  superadmin_only: { ru: "Доступ только для суперадминистратора.", tg: "Дастрасӣ танҳо барои суперадмин.", en: "Access for superadministrator only." },
  ui_language: { ru: "Язык интерфейса", tg: "Забони интерфейс", en: "Interface language" },
};

export function tr(key: string, lang: UiLang): string {
  return MSG[key]?.[lang] ?? key;
}

// errText — локализованный текст ошибки: по коду API, затем по статусу, затем message.
export function errText(err: any, lang: UiLang): string {
  const code = err && typeof err.code === "string" ? err.code : "";
  if (code && MSG[code]) return MSG[code][lang];
  if (err && err.status === 0) return MSG.network[lang];
  if (err && typeof err.message === "string" && err.message) return err.message;
  return MSG.generic[lang];
}
