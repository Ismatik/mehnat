package notify

// Уведомления суперадмину по email (SMTP). Опционально: если выключено или SMTP
// не настроен — тихо ничего не делаем (не падаем). Отправка асинхронная, ошибки
// только логируются. Зависимостей нет — stdlib net/smtp (+ tls для порта 465).

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type Notifier struct {
	enabled bool
	host    string
	port    string
	user    string
	pass    string
	from    string
	to      string
}

// FromEnv читает настройки:
//
//	NOTIFY_ENABLED=true|false, NOTIFY_EMAIL=получатель (суперадмин)
//	SMTP_HOST, SMTP_PORT(587), SMTP_USER, SMTP_PASS, SMTP_FROM
func FromEnv() *Notifier {
	n := &Notifier{
		enabled: strings.EqualFold(os.Getenv("NOTIFY_ENABLED"), "true"),
		host:    os.Getenv("SMTP_HOST"),
		port:    getenv("SMTP_PORT", "587"),
		user:    os.Getenv("SMTP_USER"),
		pass:    os.Getenv("SMTP_PASS"),
		from:    os.Getenv("SMTP_FROM"),
		to:      os.Getenv("NOTIFY_EMAIL"),
	}
	if n.from == "" {
		n.from = n.user
	}
	return n
}

// Enabled — настроен ли канал (иначе Notify — no-op).
func (n *Notifier) Enabled() bool {
	return n.enabled && n.host != "" && n.to != "" && n.from != ""
}

// Notify отправляет письмо асинхронно (best-effort). Никогда не роняет вызов.
func (n *Notifier) Notify(subject, body string) {
	if !n.Enabled() {
		return
	}
	go func() {
		if err := n.send(subject, body); err != nil {
			log.Printf("notify: не удалось отправить письмо: %v", err)
		}
	}()
}

func (n *Notifier) send(subject, body string) error {
	addr := n.host + ":" + n.port
	msg := n.build(subject, body)
	var auth smtp.Auth
	if n.user != "" {
		auth = smtp.PlainAuth("", n.user, n.pass, n.host)
	}

	// порт 465 — неявный TLS; иначе — обычное соединение + STARTTLS (через SendMail)
	if n.port == "465" {
		return n.sendTLS(addr, auth, msg)
	}
	return smtp.SendMail(addr, auth, n.from, []string{n.to}, msg)
}

func (n *Notifier) sendTLS(addr string, auth smtp.Auth, msg []byte) error {
	conn, err := tls.Dial("tcp", addr, &tls.Config{ServerName: n.host})
	if err != nil {
		return err
	}
	c, err := smtp.NewClient(conn, n.host)
	if err != nil {
		return err
	}
	defer c.Quit()
	if auth != nil {
		if err := c.Auth(auth); err != nil {
			return err
		}
	}
	if err := c.Mail(n.from); err != nil {
		return err
	}
	if err := c.Rcpt(n.to); err != nil {
		return err
	}
	wc, err := c.Data()
	if err != nil {
		return err
	}
	if _, err := wc.Write(msg); err != nil {
		return err
	}
	return wc.Close()
}

func (n *Notifier) build(subject, body string) []byte {
	h := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nDate: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n",
		n.from, n.to, subject, time.Now().Format(time.RFC1123Z),
	)
	return []byte(h + body + "\r\n")
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
