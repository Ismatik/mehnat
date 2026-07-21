package resource

// Белый список редактируемых ресурсов и описание их колонок.
// Имена базовых таблиц отсюда идут ТОЛЬКО в site.Table(), который
// дополнительно валидирует их регуляркой — SQL-инъекция через имя невозможна.

// Kind — тип колонки, определяет плейсхолдер и способ передачи значения.
type Kind int

const (
	Text Kind = iota
	JSONB
	Int
	Bool
	TS         // timestamptz (в input принимаем как строку/то, что кладёт админка)
	BigintNull // nullable bigint (parent_id меню)
)

type Column struct {
	Name string
	Kind Kind
}

// Def — описание ресурса.
type Def struct {
	Table       string   // базовое имя таблицы (без префикса сайта)
	Columns     []Column // редактируемые колонки (без id/created_at)
	PublicFlag  string   // колонка-флаг публичной видимости: is_active|published|is_published
	OrderBy     string   // сортировка по умолчанию для списков
	SlugColumn  string   // если ресурс адресуется по slug (news, pages)
	UpdatedAt   bool     // есть ли колонка updated_at (проставляем now() при UPDATE)
	// RequiredI18n — i18n-колонки, обязательные к заполнению на ВСЕХ языках при
	// публикации (в отличие от прочих i18n-полей, где пусто-везде допускается).
	RequiredI18n []string
}

// registry — единственный источ[ник] допустимых ресурсов.
var registry = map[string]Def{
	"sliders": {
		Table: "sliders", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"image_url", Text}, {"title", JSONB}, {"subtitle", JSONB},
			{"title_color", Text}, {"link_url", Text}, {"cta_label", JSONB},
			{"cta_url", Text}, {"sort_order", Int}, {"is_active", Bool},
		},
	},
	"news": {
		Table: "news", PublicFlag: "published", OrderBy: "published_at DESC NULLS LAST, id DESC", SlugColumn: "slug", UpdatedAt: true,
		RequiredI18n: []string{"title"},
		Columns: []Column{
			{"slug", Text}, {"title", JSONB}, {"excerpt", JSONB}, {"body", JSONB},
			{"cover_url", Text}, {"category", JSONB}, {"gallery", JSONB},
			{"published", Bool}, {"published_at", TS},
		},
	},
	"pages": {
		Table: "pages", PublicFlag: "is_published", OrderBy: "id ASC", SlugColumn: "slug", UpdatedAt: true,
		RequiredI18n: []string{"title"},
		Columns: []Column{
			{"slug", Text}, {"title", JSONB}, {"hero_title", JSONB}, {"hero_subtitle", JSONB},
			{"hero_image_url", Text}, {"hero_title_color", Text}, {"body", JSONB},
			{"seo_title", JSONB}, {"seo_desc", JSONB}, {"is_published", Bool},
		},
	},
	"services": {
		Table: "services", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"title", JSONB}, {"description", JSONB}, {"icon", Text},
			{"link_url", Text}, {"sort_order", Int}, {"is_active", Bool},
		},
	},
	"help_items": {
		Table: "help_items", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"icon", Text}, {"title", JSONB}, {"description", JSONB},
			{"sort_order", Int}, {"is_active", Bool},
		},
	},
	"countries": {
		Table: "countries", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		RequiredI18n: []string{"name"},
		Columns: []Column{
			{"name", JSONB}, {"description", JSONB}, {"flag_url", Text}, {"link_url", Text},
			{"highlighted", Bool}, {"available", Bool}, {"sort_order", Int}, {"is_active", Bool},
		},
	},
	"centers": {
		Table: "centers", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"city", JSONB}, {"address", JSONB}, {"phone", Text}, {"email", Text},
			{"map_url", Text}, {"sort_order", Int}, {"is_active", Bool},
		},
	},
	"team": {
		Table: "team", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"full_name", JSONB}, {"position", JSONB}, {"photo_url", Text},
			{"bio", JSONB}, {"sort_order", Int}, {"is_active", Bool},
		},
	},
	"menu": {
		Table: "menu", PublicFlag: "is_active", OrderBy: "sort_order ASC, id ASC",
		Columns: []Column{
			{"label", JSONB}, {"url", Text}, {"parent_id", BigintNull},
			{"sort_order", Int}, {"is_active", Bool},
		},
	},
	"footer_links": {
		Table: "footer_links", PublicFlag: "is_active", OrderBy: "column_no ASC, sort_order ASC, id ASC",
		Columns: []Column{
			{"label", JSONB}, {"url", Text}, {"column_no", Int},
			{"sort_order", Int}, {"is_active", Bool},
		},
	},
}

// Get возвращает описание ресурса и признак, что он есть в белом списке.
func Get(name string) (Def, bool) {
	d, ok := registry[name]
	return d, ok
}

// HasColumn проверяет, что колонка редактируема (для частичного update).
func (d Def) HasColumn(name string) (Column, bool) {
	for _, c := range d.Columns {
		if c.Name == name {
			return c, true
		}
	}
	return Column{}, false
}
