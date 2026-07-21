package handlers

// Системный статус для суперадмина: живость БД, место на диске, последний
// успешный бэкап, статус контейнеров. Только чтение. Роут — под /admin/users.
//
// Данные берутся best-effort: если что-то недоступно (нет docker-сокета, нет
// каталога бэкапов) — соответствующая секция отдаётся с ok=false и не роняет ответ.

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/mehnat/api/internal/httpx"
)

// SystemStatus — GET /admin/users/system.
func (h *Handlers) SystemStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	resp := map[string]interface{}{
		"now":        time.Now().Format(time.RFC3339),
		"db":         h.dbStatus(ctx),
		"disk":       diskStatus(h.Cfg.UploadDir, backupDir()),
		"backup":     backupStatus(),
		"containers": containerStatus(ctx),
	}
	httpx.JSON(w, http.StatusOK, resp)
}

// ---- БД ----

func (h *Handlers) dbStatus(ctx context.Context) map[string]interface{} {
	c, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	start := time.Now()
	var one int
	err := h.Pool.QueryRow(c, "SELECT 1").Scan(&one)
	latency := time.Since(start).Milliseconds()
	if err != nil {
		return map[string]interface{}{"ok": false, "error": err.Error()}
	}

	var version, size string
	_ = h.Pool.QueryRow(c, "SELECT version()").Scan(&version)
	_ = h.Pool.QueryRow(c, "SELECT pg_size_pretty(pg_database_size(current_database()))").Scan(&size)
	// краткая версия: "PostgreSQL 16.4" из полной строки
	if i := strings.Index(version, " on "); i > 0 {
		version = version[:i]
	}
	return map[string]interface{}{
		"ok":         true,
		"latency_ms": latency,
		"version":    version,
		"size":       size,
	}
}

// ---- Диск ----

type diskInfo struct {
	Path     string  `json:"path"`
	Total    uint64  `json:"total"`
	Free     uint64  `json:"free"`
	Used     uint64  `json:"used"`
	UsedPct  float64 `json:"used_pct"`
	OK       bool    `json:"ok"`
}

func diskStatus(paths ...string) []diskInfo {
	out := []diskInfo{}
	seen := map[string]bool{}
	for _, p := range paths {
		if p == "" || seen[p] {
			continue
		}
		seen[p] = true
		var st syscall.Statfs_t
		if err := syscall.Statfs(p, &st); err != nil {
			out = append(out, diskInfo{Path: p, OK: false})
			continue
		}
		bs := uint64(st.Bsize)
		total := st.Blocks * bs
		free := st.Bavail * bs
		used := total - st.Bfree*bs
		pct := 0.0
		if total > 0 {
			pct = float64(used) / float64(total) * 100
		}
		out = append(out, diskInfo{
			Path: p, Total: total, Free: free, Used: used,
			UsedPct: roundPct(pct), OK: true,
		})
	}
	return out
}

func roundPct(v float64) float64 {
	return float64(int(v*10+0.5)) / 10
}

// ---- Бэкапы ----

func backupDir() string {
	if d := os.Getenv("BACKUP_DIR"); d != "" {
		return d
	}
	return "/backups"
}

func backupStatus() map[string]interface{} {
	dir := backupDir()
	entries, err := os.ReadDir(dir)
	if err != nil {
		return map[string]interface{}{"available": false}
	}
	type dump struct {
		name string
		mod  time.Time
		size int64
	}
	var dumps []dump
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql.gz") {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		dumps = append(dumps, dump{e.Name(), info.ModTime(), info.Size()})
	}
	if len(dumps) == 0 {
		return map[string]interface{}{"available": true, "count": 0}
	}
	sort.Slice(dumps, func(i, j int) bool { return dumps[i].mod.After(dumps[j].mod) })
	last := dumps[0]
	ageHours := roundPct(time.Since(last.mod).Hours())
	return map[string]interface{}{
		"available": true,
		"count":     len(dumps),
		"last_file": last.name,
		"last_time": last.mod.Format(time.RFC3339),
		"last_size": last.size,
		"age_hours": ageHours,
	}
}

// ---- Контейнеры (через docker-сокет, если примонтирован read-only) ----

func containerStatus(ctx context.Context) map[string]interface{} {
	sock := "/var/run/docker.sock"
	if _, err := os.Stat(sock); err != nil {
		return map[string]interface{}{"available": false, "items": []interface{}{}}
	}
	tr := &http.Transport{
		DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
			var d net.Dialer
			return d.DialContext(ctx, "unix", sock)
		},
	}
	client := &http.Client{Transport: tr, Timeout: 3 * time.Second}

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "http://docker/containers/json?all=1", nil)
	res, err := client.Do(req)
	if err != nil {
		return map[string]interface{}{"available": false, "items": []interface{}{}}
	}
	defer res.Body.Close()

	var raw []struct {
		Names  []string          `json:"Names"`
		State  string            `json:"State"`
		Status string            `json:"Status"`
		Labels map[string]string `json:"Labels"`
	}
	if err := json.NewDecoder(res.Body).Decode(&raw); err != nil {
		return map[string]interface{}{"available": false, "items": []interface{}{}}
	}

	items := []map[string]interface{}{}
	for _, c := range raw {
		// только контейнеры нашего compose-проекта
		if c.Labels["com.docker.compose.project"] != composeProject() {
			continue
		}
		name := ""
		if len(c.Names) > 0 {
			name = strings.TrimPrefix(c.Names[0], "/")
		}
		items = append(items, map[string]interface{}{
			"name":    name,
			"service": c.Labels["com.docker.compose.service"],
			"state":   c.State, // running / exited / restarting ...
			"status":  c.Status,
			"health":  healthFromStatus(c.Status),
		})
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i]["name"].(string) < items[j]["name"].(string)
	})
	return map[string]interface{}{"available": true, "items": items}
}

// composeProject — имя compose-проекта (по умолчанию имя каталога = "mehnat").
func composeProject() string {
	if p := os.Getenv("COMPOSE_PROJECT_NAME"); p != "" {
		return p
	}
	// имя рабочего каталога api — не годится; берём из env, иначе дефолт
	return "mehnat"
}

// healthFromStatus вытаскивает состояние healthcheck из строки Status докера,
// напр. "Up 2 minutes (healthy)" → "healthy"; "Up (health: starting)" → "starting".
func healthFromStatus(status string) string {
	l := strings.ToLower(status)
	switch {
	case strings.Contains(l, "(healthy)"):
		return "healthy"
	case strings.Contains(l, "(unhealthy)"):
		return "unhealthy"
	case strings.Contains(l, "health: starting"):
		return "starting"
	default:
		return ""
	}
}
