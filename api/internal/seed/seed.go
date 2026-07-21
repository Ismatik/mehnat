package seed

// Стартовое наполнение БД: суперадмин из env + базовые settings/menu и
// стартовый контент обоих сайтов, портированный из design/mockup.
// Идемпотентно: settings — через ON CONFLICT DO NOTHING, остальные таблицы
// заполняются только если пусты. Повторный запуск ничего не ломает.

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/config"
	"github.com/mehnat/api/internal/site"
)

// j маршалит значение в JSON-строку для передачи как ::jsonb.
func j(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

// tri — трилингвальный объект {ru,tg,en}. Если перевод неизвестен — дублируем ru
// (редакторы переведут из админки).
func tri(ru, tg, en string) map[string]string {
	if tg == "" {
		tg = ru
	}
	if en == "" {
		en = ru
	}
	return map[string]string{"ru": ru, "tg": tg, "en": en}
}

// triRu — быстрый трилингвал, где все три языка = ru (заглушка перевода).
func triRu(ru string) map[string]string { return tri(ru, "", "") }

// Run выполняет полный посев.
func Run(ctx context.Context, pool *pgxpool.Pool, cfg config.Config) error {
	if err := seedSuperadmin(ctx, pool, cfg); err != nil {
		return fmt.Errorf("seed superadmin: %w", err)
	}
	for _, key := range []site.Key{site.Key(cfg.Site1Key), site.Key(cfg.Site2Key)} {
		s, err := site.Resolve(string(key))
		if err != nil {
			return fmt.Errorf("resolve site %q: %w", key, err)
		}
		if err := seedSite(ctx, pool, s); err != nil {
			return fmt.Errorf("seed site %q: %w", key, err)
		}
	}
	return nil
}

func seedSuperadmin(ctx context.Context, pool *pgxpool.Pool, cfg config.Config) error {
	if cfg.SeedAdminPassword == "" {
		log.Println("seed: SEED_ADMIN_PASSWORD пуст — суперадмин не создаётся")
		return nil
	}
	var exists bool
	if err := pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, cfg.SeedAdminEmail).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return nil
	}
	hash, err := auth.HashPassword(cfg.SeedAdminPassword)
	if err != nil {
		return err
	}
	_, err = pool.Exec(ctx,
		`INSERT INTO users (email, password_hash, full_name, role, site_access, is_active)
		 VALUES ($1, $2, $3, 'superadmin', $4, TRUE)`,
		cfg.SeedAdminEmail, hash, "Супер администратор", []string{"s1", "s2"},
	)
	if err == nil {
		log.Printf("seed: создан суперадмин %s", cfg.SeedAdminEmail)
	}
	return err
}

// count возвращает число строк в таблице.
func count(ctx context.Context, pool *pgxpool.Pool, table string) (int, error) {
	var n int
	err := pool.QueryRow(ctx, "SELECT count(*) FROM "+table).Scan(&n)
	return n, err
}

func seedSite(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	if err := seedSettings(ctx, pool, s); err != nil {
		return err
	}
	steps := []func(context.Context, *pgxpool.Pool, site.Site) error{
		seedMenu, seedSliders, seedCountries, seedHelpItems,
		seedCenters, seedFooterLinks, seedNews, seedPages,
	}
	for _, fn := range steps {
		if err := fn(ctx, pool, s); err != nil {
			return err
		}
	}
	return nil
}

func seedSettings(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("settings")
	// значения JSONB: строки хранятся как JSON-строки, трилингвал — как объекты
	settings := map[string]interface{}{
		"site_title":           triRu("Центры консультирования и подготовки трудовых мигрантов перед выездом"),
		"site_subtitle":        triRu("Государственное учреждение"),
		"org_status":           triRu("Государственное учреждение · Республика Таджикистан"),
		"logo_url":             "",
		"president_photo_url":  "",
		"president_url":        "https://www.president.tj",
		"president_label":      triRu("Президент Республики Таджикистан"),
		"president_caption":    triRu("Послания и выступления Основателя мира и национального единства — Лидера нации"),
		"phone_1":              "225-05-75",
		"phone_2":              "225-02-21",
		"email":                "info@markaz.tj",
		"address":              triRu("г. Душанбе, Республика Таджикистан"),
		"facebook_url":         "",
		"instagram_url":        "",
		"youtube_url":          "",
		"telegram_url":         "",
		"telegram_handle":      "@____________",
		"ats_url":              "",
		"qr_registration_url":  "",
		"qr_telegram_url":      "",
		"copyright":            triRu("© 2026 Государственное учреждение «Центры консультирования и подготовки трудовых мигрантов перед выездом»"),
		"footer_copyright":     triRu("Ҳуқуқҳо ҳимоя шудаанд © All rights reserved 2026"),
		"warning_title":        triRu("Никому не платите за наши услуги"),
		"warning_text":         triRu("Государственный Центр никогда не берёт денег. Если кто-то обещает устроить вас на работу «через Центр» за плату — это обман. Не отдавайте посредникам деньги, паспорт или документы. Сначала проверьте у нас."),
		"warning_link":         triRu("Как распознать обман"),
		"hero_default_image":   "",
		"languages":            []string{"ru", "tg", "en"},
		"accent_color":         accentFor(s.Key),
		"register_title":       triRu("Зарегистрируйтесь в Центре"),
		"register_text":        triRu("Полный доступ к услугам Центра, актуальная информация и поддержка на каждом этапе. Бесплатно, ваши данные под защитой государства."),
		"telegram_title":       triRu("Наш Telegram"),
		"telegram_text":        triRu("Вступайте в наш Telegram — задавайте вопросы и получайте ответы от Центра."),
	}
	for k, v := range settings {
		_, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`, tbl),
			k, j(v),
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// accentFor — акцентный цвет: сайт 2 отличается (по требованию).
func accentFor(k site.Key) string {
	if k == "s2" {
		return "#0e7a5e" // site-override для сайта 2 (зелёный акцент)
	}
	return "#d52b1e"
}

func seedMenu(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("menu")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	items := []struct {
		label map[string]string
		url   string
	}{
		{tri("О Центре", "Дар бораи Марказ", "About Center"), "/"},
		{tri("Новости", "Хабарҳо", "News"), "/novosti"},
		{tri("О нас", "Дар бораи мо", "About us"), "/o-nas"},
		{tri("Страна назначения", "Кишвари таъинот", "Destination country"), "/uslugi"},
		{tri("Контакты", "Тамос", "Contacts"), "/kontakty"},
	}
	for i, it := range items {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (label, url, sort_order, is_active) VALUES ($1::jsonb, $2, $3, TRUE)`, tbl),
			j(it.label), it.url, i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedSliders(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("sliders")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	slides := []struct {
		title, subtitle, cta map[string]string
	}{
		{
			triRu("Собираетесь на работу за границу? Начните с безопасного шага."),
			triRu("Мы — государственный Центр. Помогаем гражданам Таджикистана уехать на работу законно и безопасно."),
			triRu("Узнать, с чего начать →"),
		},
		{
			triRu("Проверенные работодатели и честные условия труда за рубежом."),
			triRu("Каждая вакансия проходит проверку. Никаких посредников и скрытых платежей — только законные каналы трудоустройства."),
			triRu("Смотреть страны →"),
		},
		{
			triRu("Не дайте себя обмануть. Консультируйтесь в государственном Центре."),
			triRu("Бесплатные консультации, помощь с документами и защита ваших прав на всех этапах трудоустройства."),
			triRu("Получить консультацию →"),
		},
	}
	for i, sl := range slides {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (image_url, title, subtitle, cta_label, cta_url, sort_order, is_active)
			 VALUES ('', $1::jsonb, $2::jsonb, $3::jsonb, '#reg', $4, TRUE)`, tbl),
			j(sl.title), j(sl.subtitle), j(sl.cta), i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedCountries(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("countries")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	// description хранит структурированный объект master-detail главной страницы.
	type detail struct {
		Code         string            `json:"code"`
		Short        map[string]string `json:"short"`
		Tagline      map[string]string `json:"tagline"`
		Earnings     string            `json:"earnings"`
		EarningsNote map[string]string `json:"earnings_note"`
		Docs         map[string]string `json:"docs"`
		Steps        []map[string]string `json:"steps"`
		Note         map[string]string `json:"note"`
	}
	countries := []struct {
		name        map[string]string
		link        string
		highlighted bool
		available   bool
		d           detail
	}{
		{triRu("Россия"), "", false, false, detail{
			Code: "RU", Short: triRu("Патент и трудовой договор"),
			Tagline:  triRu("Куда уезжает большинство — читать внимательно"),
			Earnings: "60 000 – 90 000 ₽ / мес",
			EarningsNote: triRu("На руки после жилья и питания — ориентировочно 45 000 – 65 000 ₽"),
			Docs:  triRu("Загранпаспорт, миграционная карта, патент, полис ДМС, регистрация в течение 7 дней"),
			Steps: []map[string]string{triRu("Оформите загранпаспорт и получите патент"), triRu("Заключите официальный трудовой договор"), triRu("Пройдите медосмотр и дактилоскопию"), triRu("Встаньте на миграционный учёт по прибытии")},
			Note:  triRu("Работайте только по патенту и договору. Без документов — риск штрафа и выдворения."),
		}},
		{triRu("Великобритания"), "", true, false, detail{
			Code: "UK", Short: triRu("Рабочая виза со спонсором"),
			Tagline:  triRu("Только по официальному приглашению работодателя"),
			Earnings: "£1 600 – £2 400 / мес",
			EarningsNote: triRu("Высокая стоимость жизни — заранее уточните расходы на жильё"),
			Docs:  triRu("Загранпаспорт, приглашение (Certificate of Sponsorship), рабочая виза, знание английского"),
			Steps: []map[string]string{triRu("Найдите работодателя с лицензией спонсора"), triRu("Получите Certificate of Sponsorship"), triRu("Подайте документы на рабочую визу"), triRu("Пройдите биометрию и медосмотр")},
			Note:  triRu("Виза оформляется только через лицензированного работодателя. Остерегайтесь фальшивых приглашений."),
		}},
		{triRu("Южная Корея"), "", false, false, detail{
			Code: "KR", Short: triRu("Программа EPS"),
			Tagline:  triRu("Трудоустройство по системе разрешений (EPS)"),
			Earnings: "₩2 000 000 – ₩2 600 000 / мес",
			EarningsNote: triRu("Требуется сдать экзамен по корейскому языку (EPS-TOPIK)"),
			Docs:  triRu("Загранпаспорт, сертификат EPS-TOPIK, медсправка, трудовой контракт"),
			Steps: []map[string]string{triRu("Сдайте языковой экзамен EPS-TOPIK"), triRu("Зарегистрируйтесь в системе EPS"), triRu("Дождитесь выбора работодателем"), triRu("Оформите визу E-9 и выезжайте")},
			Note:  triRu("Приём заявок — только через государственную программу EPS. Частные посредники не имеют права её оформлять."),
		}},
		{triRu("Польша"), "", true, false, detail{
			Code: "PL", Short: triRu("Рабочая виза (тип D)"),
			Tagline:  triRu("Один из основных рынков труда в ЕС"),
			Earnings: "3 500 – 5 000 zł / мес",
			EarningsNote: triRu("Часто предоставляется жильё от работодателя"),
			Docs:  triRu("Загранпаспорт, приглашение на работу, рабочая виза D, страховка"),
			Steps: []map[string]string{triRu("Получите приглашение (oświadczenie / zezwolenie)"), triRu("Подайте на национальную визу типа D"), triRu("Оформите медицинскую страховку"), triRu("Пройдите собеседование в консульстве")},
			Note:  triRu("Проверяйте приглашение в реестре работодателей. Не платите за «гарантированное» трудоустройство."),
		}},
		{triRu("Латвия"), "", false, false, detail{
			Code: "LV", Short: triRu("Рабочая виза (ЕС)"),
			Tagline:  triRu("Работа в странах Балтии по визе ЕС"),
			Earnings: "€900 – €1 400 / мес",
			EarningsNote: triRu("Знание базового английского или русского приветствуется"),
			Docs:  triRu("Загранпаспорт, приглашение работодателя, рабочая виза, страховка"),
			Steps: []map[string]string{triRu("Получите разрешение на трудоустройство"), triRu("Оформите национальную рабочую визу"), triRu("Сделайте медицинскую страховку"), triRu("Зарегистрируйтесь по прибытии")},
			Note:  triRu("Убедитесь, что работодатель зарегистрирован официально и договор оформлен на латышском и понятном вам языке."),
		}},
		{triRu("Германия"), "/rabota-v-germanii", false, true, detail{
			Code: "DE", Short: triRu("Голубая карта / рабочая виза"),
			Tagline:  triRu("Требуется квалификация и знание языка"),
			Earnings: "€2 200 – €3 200 / мес",
			EarningsNote: triRu("Нужно подтверждение квалификации и уровень немецкого A2–B1"),
			Docs:  triRu("Загранпаспорт, подтверждение диплома, трудовой договор, рабочая виза"),
			Steps: []map[string]string{triRu("Подтвердите квалификацию (Anerkennung)"), triRu("Найдите работодателя и договор"), triRu("Подайте на рабочую визу или Blue Card"), triRu("Пройдите собеседование в посольстве")},
			Note:  triRu("Признание диплома обязательно для большинства профессий. Начните с проверки квалификации."),
		}},
	}
	for i, c := range countries {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (name, description, flag_url, link_url, highlighted, available, sort_order, is_active)
			 VALUES ($1::jsonb, $2::jsonb, '', $3, $4, $5, $6, TRUE)`, tbl),
			j(c.name), j(c.d), c.link, c.highlighted, c.available, i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedHelpItems(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("help_items")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	items := []struct {
		icon        string
		title, desc map[string]string
	}{
		{"🔎", triRu("Узнаете правду о стране"), triRu("Сколько реально останется денег после всех расходов и что вас ждёт на месте")},
		{"📋", triRu("Соберёте документы"), triRu("Поможем понять, какие нужны бумаги, и подготовить их правильно")},
		{"🎓", triRu("Пройдёте подготовку"), triRu("Обучение перед выездом, чтобы вы уехали готовым к работе")},
		{"📜", triRu("Получите свидетельство"), triRu("Документ о навыках — пригодится и за границей, и дома")},
	}
	for i, it := range items {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (icon, title, description, sort_order, is_active) VALUES ($1, $2::jsonb, $3::jsonb, $4, TRUE)`, tbl),
			it.icon, j(it.title), j(it.desc), i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedCenters(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("centers")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	centers := []struct {
		city, address map[string]string
		phone         string
	}{
		{triRu("Душанбе"), triRu("Головной центр, Республика Таджикистан"), "225-05-75"},
		{triRu("Бохтар"), triRu("Хатлонская область"), "+992 __ ___ __ __"},
		{triRu("Худжанд"), triRu("Согдийская область"), "+992 __ ___ __ __"},
		{triRu("Хорог"), triRu("ГБАО"), "+992 __ ___ __ __"},
	}
	for i, c := range centers {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (city, address, phone, sort_order, is_active) VALUES ($1::jsonb, $2::jsonb, $3, $4, TRUE)`, tbl),
			j(c.city), j(c.address), c.phone, i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedFooterLinks(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("footer_links")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	links := []struct {
		label  map[string]string
		url    string
		column int
	}{
		{triRu("О Центре"), "/", 1},
		{triRu("Страны"), "/uslugi", 1},
		{triRu("Перед выездом"), "/rabota-v-germanii", 1},
		{triRu("Новости"), "/novosti", 2},
		{triRu("Регистрация"), "#reg", 2},
		{triRu("Как распознать обман"), "/", 2},
	}
	for i, l := range links {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (label, url, column_no, sort_order, is_active) VALUES ($1::jsonb, $2, $3, $4, TRUE)`, tbl),
			j(l.label), l.url, l.column, i,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedNews(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("news")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}
	news := []struct {
		slug        string
		title       map[string]string
		date        string
	}{
		{"info-isfara", triRu("Информационно-просветительская работа в городе Исфара"), "2024-04-19 12:15"},
		{"info-kanibadam", triRu("Проведение информационно-просветительской работы в городе Канибадам"), "2024-04-19 12:14"},
		{"fair-temurmalik", triRu("Ярмарка свободных вакансий в Центре района Темурмалик"), "2024-04-19 12:12"},
		{"meeting-pongoz", triRu("Встреча с жителями джамоата Понгози района Ашт"), "2024-04-19 11:56"},
		{"course-before-departure", triRu("Обучающий курс перед выездом: практические навыки"), "2024-04-18 16:30"},
		{"warning-fraud", triRu("Осторожно: мошенники под видом сотрудников Центра"), "2024-04-17 09:45"},
	}
	cat := triRu("Новости")
	for _, nw := range news {
		if _, err := pool.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (slug, title, excerpt, body, category, published, published_at)
			 VALUES ($1, $2::jsonb, '{}'::jsonb, '{}'::jsonb, $3::jsonb, TRUE, $4::timestamptz)`, tbl),
			nw.slug, j(nw.title), j(cat), nw.date,
		); err != nil {
			return err
		}
	}
	return nil
}

func seedPages(ctx context.Context, pool *pgxpool.Pool, s site.Site) error {
	tbl := s.Table("pages")
	if n, err := count(ctx, pool, tbl); err != nil || n > 0 {
		return err
	}

	// ---- Страница «О нас» ----
	onasBody := map[string]interface{}{
		"heading": triRu("Государственное учреждение «Центры консультирования и предвыездной подготовки трудовых мигрантов»"),
		"goal_title":    triRu("Наша цель"),
		"goal_subtitle": triRu("Обеспечение полной готовности граждан Таджикистана к безопасной миграции за рубеж"),
		"goal_text":     triRu("Обеспечение полной готовности граждан Таджикистана к безопасной миграции за рубеж. Центры функционируют в городах Душанбе, Бохтар, Худжанд и Хорог. Мы планируем открыть новые центры в городах Куляб, Вахдат, Гиссар и Дангара и расширить их число."),
		"collage":       []string{"", "", "", ""},
		"list1_title":   triRu("Повышение уровня образования граждан"),
		"list1": []map[string]string{
			triRu("Проводить консультации и информационные сессии для потенциальных иммигрантов о странах назначения и вариантах иммиграции. Проведение целевых тренингов для граждан Таджикистана, принятых на работу в Великобританию по программе «Сезонные работники»."),
			triRu("Возвращение граждан в «Центр образования взрослых» для прохождения обучения и получения Свидетельства о подтверждении профессиональных навыков"),
			triRu("Исследование рынка труда стран, принимающих трудовых мигрантов"),
			triRu("Приём граждан, ищущих работу, в языковые секции"),
			triRu("Направление абитуриентов в «Центр образования взрослых» на прохождение профориентационных разделов"),
			triRu("Граждане, которые ищут работу"),
			triRu("Приём абитуриентов на языковые курсы"),
		},
		"list2_title": triRu("2. Поддержка возвращающихся мигрантов и их дальнейшая деятельность"),
		"list2": []map[string]string{
			triRu("Медицинское обследование (инфекционные заболевания, такие как ВИЧ/СПИД/туберкулёз)"),
			triRu("Возвращение граждан в «Центр образования взрослых» для прохождения обучения и получения сертификата об утверждении навыков, приобретённых в профессиях в государствах назначения"),
		},
	}
	if _, err := pool.Exec(ctx,
		fmt.Sprintf(`INSERT INTO %s (slug, title, hero_title, body, is_published)
		 VALUES ('o-nas', $1::jsonb, $1::jsonb, $2::jsonb, TRUE)`, tbl),
		j(triRu("О нас")), j(onasBody),
	); err != nil {
		return err
	}

	// ---- Страница «Работа в Германии» ----
	deBody := map[string]interface{}{
		"intro": triRu("Германия принимает иностранных работников по государственным программам трудоустройства. Центр консультирует граждан Таджикистана по легальному порядку выезда, помогает подготовить документы и пройти обучение перед отъездом. Ниже — что важно знать и с чего начать."),
		"facts": []map[string]interface{}{
			{"label": triRu("Средняя зарплата"), "value": "€2 200–3 200", "note": triRu("в месяц, до налогов, зависит от сферы")},
			{"label": triRu("Виза"), "value": triRu("Рабочая / Blue Card"), "note": triRu("национальная виза типа D по приглашению")},
			{"label": triRu("Язык"), "value": "A2–B1", "note": triRu("немецкий, для большинства профессий")},
			{"label": triRu("Контракт"), "value": triRu("от 12 мес"), "note": triRu("официальный трудовой договор")},
		},
		"help": []map[string]string{
			triRu("Консультация о легальном порядке выезда и трудоустройства"),
			triRu("Проверка работодателя и условий трудового договора"),
			triRu("Направление на языковые курсы и профориентацию"),
			triRu("Помощь в подготовке документов и подаче на визу"),
			triRu("Выдача Свидетельства о подтверждении профессиональных навыков"),
		},
		"professions": []map[string]string{
			triRu("Уход за пожилыми"), triRu("Медсёстры"), triRu("Строители"), triRu("Сварщики"),
			triRu("Электрики"), triRu("Водители"), triRu("Повара"), triRu("Сельское хозяйство"), triRu("Логистика"),
		},
		"language_note": triRu("Для большинства профессий требуется немецкий на уровне A2–B1. Центр направляет на языковые курсы и профориентацию перед выездом."),
		"steps": []map[string]interface{}{
			{"n": "01", "title": triRu("Регистрация"), "desc": triRu("Обратитесь в Центр и подайте заявку")},
			{"n": "02", "title": triRu("Подготовка"), "desc": triRu("Язык, профориентация, подтверждение навыков")},
			{"n": "03", "title": triRu("Работодатель"), "desc": triRu("Подбор вакансии и приглашение на работу")},
			{"n": "04", "title": triRu("Виза"), "desc": triRu("Подача на рабочую визу или Blue Card")},
			{"n": "05", "title": triRu("Выезд"), "desc": triRu("Легальный выезд и сопровождение")},
		},
		"documents": []map[string]string{
			triRu("Загранпаспорт (действующий не менее срока контракта)"),
			triRu("Подтверждение квалификации / диплома (Anerkennung)"),
			triRu("Трудовой договор или приглашение работодателя"),
			triRu("Сертификат о знании немецкого языка (A2–B1)"),
			triRu("Медицинская страховка и справка о состоянии здоровья"),
		},
		"warning_title": triRu("Никому не платите за трудоустройство"),
		"warning_text":  triRu("Все услуги Центра бесплатны. Официальная рабочая виза в Германию оформляется только через лицензированного работодателя. Остерегайтесь посредников, которые обещают «гарантированное» место за деньги, и не отдавайте им паспорт или оригиналы документов."),
	}
	if _, err := pool.Exec(ctx,
		fmt.Sprintf(`INSERT INTO %s (slug, title, hero_title, hero_title_color, body, is_published)
		 VALUES ('rabota-v-germanii', $1::jsonb, $1::jsonb, '#e8912a', $2::jsonb, TRUE)`, tbl),
		j(triRu("Работа в Германии")), j(deBody),
	); err != nil {
		return err
	}
	return nil
}
