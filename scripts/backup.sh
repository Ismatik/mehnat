#!/bin/sh
# ============================================================
#  Бэкап PostgreSQL. Запускается контейнером `backup` (образ postgres:16-alpine,
#  в нём есть pg_dump и psql). Дампы кладутся в volume /backups.
#
#  Режимы:
#    (без аргументов) — планировщик: бэкап при старте, затем ежедневно в BACKUP_HOUR:00
#    once            — один бэкап сейчас (ручной): sh /backup.sh once
#    restore <файл>  — восстановить БД из дампа: sh /backup.sh restore mehnat_....sql.gz
#
#  ENV: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, BACKUP_KEEP_DAYS(14), BACKUP_HOUR(3)
# ============================================================

DIR=/backups
KEEP="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-3}"
export PGPASSWORD="${POSTGRES_PASSWORD:-}"

log() { echo "[backup] $(date '+%Y-%m-%d %H:%M:%S') $*"; }

do_backup() {
  mkdir -p "$DIR"
  ts=$(date +%Y-%m-%d_%H%M%S)
  f="$DIR/mehnat_${ts}.sql.gz"
  tmp="$DIR/.dump.$$.sql"
  log "дамп → $f"
  if pg_dump -h db -U "$POSTGRES_USER" --clean --if-exists "$POSTGRES_DB" >"$tmp" 2>"$DIR/.dump.$$.err"; then
    gzip -c "$tmp" >"${f}.part" && mv "${f}.part" "$f"
    rm -f "$tmp" "$DIR/.dump.$$.err"
    log "OK ($(du -h "$f" | cut -f1))"
  else
    log "ОШИБКА pg_dump:"; cat "$DIR/.dump.$$.err" 2>/dev/null
    rm -f "$tmp" "$DIR/.dump.$$.err" "${f}.part"
    return 1
  fi
  # ротация: удаляем дампы старше KEEP дней
  find "$DIR" -maxdepth 1 -name 'mehnat_*.sql.gz' -type f -mtime +"$KEEP" -print -delete 2>/dev/null | while read -r d; do log "ротация: удалён $d"; done
  log "дампов в наличии: $(ls -1 "$DIR"/mehnat_*.sql.gz 2>/dev/null | wc -l)"
}

do_restore() {
  file="$DIR/$1"
  if [ ! -f "$file" ]; then
    echo "Файл не найден: $file"; echo "Доступные дампы:"; ls -1 "$DIR"/mehnat_*.sql.gz 2>/dev/null; exit 1
  fi
  log "ВОССТАНОВЛЕНИЕ из $file (текущие данные будут заменены)…"
  if gunzip -c "$file" | psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 >/dev/null; then
    log "восстановление ЗАВЕРШЕНО"
  else
    log "восстановление НЕ УДАЛОСЬ"; exit 1
  fi
}

case "${1:-}" in
  once)    do_backup; exit $? ;;
  restore) shift; [ -n "${1:-}" ] || { echo "Укажи файл: sh /backup.sh restore mehnat_....sql.gz"; exit 1; }; do_restore "$1"; exit $? ;;
esac

# ---- планировщик ----
# Убираем ведущие нули: busybox $(( )) трактует 08/09 как восьмеричное → ошибка.
nz() { v="${1#0}"; echo "${v:-0}"; }

log "старт планировщика (ежедневно в ${HOUR}:00, хранение ${KEEP} дн.)"
do_backup
while true; do
  H=$(nz "$(date +%H)"); M=$(nz "$(date +%M)"); S=$(nz "$(date +%S)")
  TH=$(nz "$HOUR")
  now=$(( H * 3600 + M * 60 + S ))
  target=$(( TH * 3600 ))
  [ "$target" -le "$now" ] && target=$(( target + 86400 ))
  wait=$(( target - now ))
  log "следующий бэкап через ${wait}с"
  sleep "$wait"
  do_backup
done
