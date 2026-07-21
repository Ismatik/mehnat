-- ============================================================
--  Наполнение контента САЙТА 2 (s2_*). Второй сайт — СВОЙ бренд и тексты
--  (a-khorijakor.tj: внешняя трудовая миграция), плюс полные переводы ru/tg/en.
--  Фактический справочный контент (страны, страницы) переиспользуется —
--  это объективная информация, одинаковая для обоих сайтов.
--  Затрагивает ТОЛЬКО s2_* (site1 не трогаем). Акцент s2 — зелёный (в сиде).
-- ============================================================
BEGIN;

-- Акцент сайта 2 (site-override): бирюзово-зелёный гос-стиль, заметно отличается
-- от красного s1. Меняется одной правкой этого ключа (или из админки → Настройки).
UPDATE s2_settings SET value = to_jsonb('#0e7a5e'::text) WHERE key='accent_color';

-- ---------------- SETTINGS (свой бренд) ----------------
UPDATE s2_settings SET value = jsonb_build_object('ru','Центр внешней трудовой миграции и зарубежного трудоустройства','tg','Маркази муҳоҷирати меҳнатии хориҷӣ ва корёбии беруна','en','Center for External Labor Migration and Overseas Employment') WHERE key='site_title';
UPDATE s2_settings SET value = jsonb_build_object('ru','Государственное учреждение','tg','Муассисаи давлатӣ','en','State Institution') WHERE key='site_subtitle';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','Муассисаи давлатӣ · Ҷумҳурии Тоҷикистон','en','State Institution · Republic of Tajikistan') WHERE key='org_status';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','Президенти Ҷумҳурии Тоҷикистон','en','President of the Republic of Tajikistan') WHERE key='president_label';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','Паёмҳо ва суханрониҳои Асосгузори сулҳу ваҳдати миллӣ — Пешвои миллат','en','Messages and speeches of the Founder of Peace and National Unity — Leader of the Nation') WHERE key='president_caption';
UPDATE s2_settings SET value = jsonb_build_object('ru','Остерегайтесь незаконных посредников','tg','Аз миёнаравҳои ғайриқонунӣ эҳтиёт шавед','en','Beware of illegal intermediaries') WHERE key='warning_title';
UPDATE s2_settings SET value = jsonb_build_object('ru','Официальное трудоустройство за рубежом — только через государственные каналы. Мы не берём плату за трудоустройство. Не передавайте деньги и документы посредникам.','tg','Корёбии расмӣ дар хориҷа — танҳо тавассути роҳҳои давлатӣ. Мо барои корёбӣ пул намегирем. Пул ва ҳуҷҷатҳоро ба миёнаравҳо надиҳед.','en','Official overseas employment is only through state channels. We do not charge for employment. Do not hand money or documents to intermediaries.') WHERE key='warning_text';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','Чӣ гуна фиребро шинохтан','en','How to recognize fraud') WHERE key='warning_link';
UPDATE s2_settings SET value = jsonb_build_object('ru','Подайте заявку на трудоустройство','tg','Ариза барои корёбӣ супоред','en','Apply for employment') WHERE key='register_title';
UPDATE s2_settings SET value = jsonb_build_object('ru','Зарегистрируйтесь, чтобы получить доступ к проверенным вакансиям за рубежом и сопровождению на всех этапах. Бесплатно.','tg','Бақайд гиред, то ба ҷойҳои кории санҷидашудаи хориҷӣ ва ҳамроҳӣ дар ҳама марҳилаҳо дастрасӣ пайдо кунед. Ройгон.','en','Register to access verified overseas vacancies and support at every stage. Free of charge.') WHERE key='register_title';
UPDATE s2_settings SET value = jsonb_build_object('ru','Зарегистрируйтесь, чтобы получить доступ к проверенным вакансиям за рубежом и сопровождению на всех этапах. Бесплатно.','tg','Бақайд гиред, то ба ҷойҳои кории санҷидашудаи хориҷӣ ва ҳамроҳӣ дар ҳама марҳилаҳо дастрасӣ пайдо кунед. Ройгон.','en','Register to access verified overseas vacancies and support at every stage. Free of charge.') WHERE key='register_text';
UPDATE s2_settings SET value = jsonb_build_object('ru','Наш Telegram','tg','Телеграми мо','en','Our Telegram') WHERE key='telegram_title';
UPDATE s2_settings SET value = jsonb_build_object('ru','Подпишитесь на наш Telegram — свежие вакансии и ответы на вопросы о выезде.','tg','Ба Телеграми мо обуна шавед — ҷойҳои кории нав ва посух ба саволҳо дар бораи сафар.','en','Subscribe to our Telegram — fresh vacancies and answers about departure.') WHERE key='telegram_text';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','ш. Душанбе, Ҷумҳурии Тоҷикистон','en','Dushanbe, Republic of Tajikistan') WHERE key='address';
UPDATE s2_settings SET value = jsonb_build_object('ru','© 2026 Государственное учреждение «Центр внешней трудовой миграции и зарубежного трудоустройства»','tg','© 2026 Муассисаи давлатии «Маркази муҳоҷирати меҳнатии хориҷӣ ва корёбии беруна»','en','© 2026 State Institution "Center for External Labor Migration and Overseas Employment"') WHERE key='copyright';
UPDATE s2_settings SET value = value || jsonb_build_object('tg','Ҳуқуқҳо ҳимоя шудаанд © Ҳамаи ҳуқуқҳо ҳифз шудаанд 2026','en','All rights reserved © 2026') WHERE key='footer_copyright';

-- ---------------- SLIDERS (свои) ----------------
UPDATE s2_sliders SET
  title = jsonb_build_object('ru','Легальная работа за рубежом — через государственный портал.','tg','Кори қонунӣ дар хориҷа — тавассути портали давлатӣ.','en','Legal work abroad — through the state portal.'),
  subtitle = jsonb_build_object('ru','Проверенные работодатели, честные контракты и защита ваших прав за границей.','tg','Корфармоёни санҷидашуда, шартномаҳои одилона ва ҳимояи ҳуқуқҳои шумо дар хориҷа.','en','Verified employers, fair contracts and protection of your rights abroad.'),
  cta_label = jsonb_build_object('ru','Подать заявку →','tg','Ариза супоридан →','en','Apply now →')
  WHERE sort_order=0;
UPDATE s2_sliders SET
  title = jsonb_build_object('ru','Востребованные профессии и достойная оплата за границей.','tg','Касбҳои талабот ва музди муносиб дар хориҷа.','en','In-demand professions and decent pay abroad.'),
  subtitle = jsonb_build_object('ru','Мы подберём подходящую вакансию и поможем оформить документы правильно.','tg','Мо ҷои кори мувофиқро интихоб мекунем ва дар омода кардани ҳуҷҷатҳо кӯмак мерасонем.','en','We will match a suitable vacancy and help prepare documents correctly.'),
  cta_label = jsonb_build_object('ru','Смотреть страны →','tg','Кишварҳоро дидан →','en','View countries →')
  WHERE sort_order=1;
UPDATE s2_sliders SET
  title = jsonb_build_object('ru','Не платите посредникам — консультация в Центре бесплатна.','tg','Ба миёнаравҳо пул надиҳед — машварат дар Марказ ройгон аст.','en','Do not pay intermediaries — consultation at the Center is free.'),
  subtitle = jsonb_build_object('ru','Государственное сопровождение защищает вас от обмана и незаконных схем.','tg','Ҳамроҳии давлатӣ шуморо аз фиреб ва нақшаҳои ғайриқонунӣ ҳимоя мекунад.','en','State support protects you from fraud and illegal schemes.'),
  cta_label = jsonb_build_object('ru','Получить консультацию →','tg','Машварат гирифтан →','en','Get a consultation →')
  WHERE sort_order=2;

-- ---------------- HELP ITEMS (свои) ----------------
UPDATE s2_help_items SET title=jsonb_build_object('ru','Проверим вакансию и работодателя','tg','Ҷои корӣ ва корфарморо месанҷем','en','We verify the vacancy and employer'), description=jsonb_build_object('ru','Убедимся, что предложение легально и условия честные','tg','Боварӣ ҳосил мекунем, ки пешниҳод қонунӣ ва шароит одилона аст','en','We make sure the offer is legal and the terms are fair') WHERE icon='🔎';
UPDATE s2_help_items SET title=jsonb_build_object('ru','Оформим документы правильно','tg','Ҳуҷҷатҳоро дуруст омода мекунем','en','We prepare documents correctly'), description=jsonb_build_object('ru','Подскажем список и поможем подготовить всё для выезда','tg','Рӯйхатро мегӯем ва дар омодасозии ҳама чиз барои сафар кӯмак мекунем','en','We will list what is needed and help prepare everything for departure') WHERE icon='📋';
UPDATE s2_help_items SET title=jsonb_build_object('ru','Подготовим к работе и языку','tg','Ба кор ва забон омода мекунем','en','We prepare you for work and language'), description=jsonb_build_object('ru','Курсы и профориентация перед выездом за рубеж','tg','Курсҳо ва касбинтихобкунӣ пеш аз сафар ба хориҷа','en','Courses and career guidance before going abroad') WHERE icon='🎓';
UPDATE s2_help_items SET title=jsonb_build_object('ru','Выдадим документ о квалификации','tg','Ҳуҷҷати тахассус медиҳем','en','We issue a qualification document'), description=jsonb_build_object('ru','Свидетельство пригодится и за рубежом, и по возвращении','tg','Шаҳодатнома ҳам дар хориҷа ва ҳам пас аз бозгашт ба кор меояд','en','The certificate is useful both abroad and after returning') WHERE icon='📜';

-- ---------------- NEWS (свои события) ----------------
UPDATE s2_news SET title=jsonb_build_object('ru','Приём заявок на сезонную работу в Согдийской области','tg','Қабули аризаҳо барои кори мавсимӣ дар вилояти Суғд','en','Applications open for seasonal work in Sughd region') WHERE slug='info-isfara';
UPDATE s2_news SET title=jsonb_build_object('ru','Онлайн-регистрация вакансий за рубежом теперь доступна','tg','Бақайдгирии онлайни ҷойҳои корӣ дар хориҷа ҳоло дастрас аст','en','Online registration of overseas vacancies is now available') WHERE slug='info-kanibadam';
UPDATE s2_news SET title=jsonb_build_object('ru','Ярмарка вакансий с зарубежными работодателями','tg','Ярмаркаи ҷойҳои корӣ бо корфармоёни хориҷӣ','en','Job fair with foreign employers') WHERE slug='fair-temurmalik';
UPDATE s2_news SET title=jsonb_build_object('ru','Разъяснительная встреча о правах трудовых мигрантов','tg','Вохӯрии фаҳмондадиҳӣ дар бораи ҳуқуқи муҳоҷирони меҳнатӣ','en','Awareness meeting on the rights of labor migrants') WHERE slug='meeting-pongoz';
UPDATE s2_news SET title=jsonb_build_object('ru','Курсы языковой подготовки перед выездом','tg','Курсҳои омодагии забонӣ пеш аз сафар','en','Language preparation courses before departure') WHERE slug='course-before-departure';
UPDATE s2_news SET title=jsonb_build_object('ru','Как отличить официальную вакансию от мошеннической','tg','Чӣ гуна ҷои кории расмиро аз фиребгарона фарқ кардан','en','How to tell an official vacancy from a fraudulent one') WHERE slug='warning-fraud';

-- ---------------- CENTERS (те же города, переводы) ----------------
UPDATE s2_centers SET city=city||jsonb_build_object('tg','Душанбе','en','Dushanbe'), address=address||jsonb_build_object('tg','Маркази марказӣ, Ҷумҳурии Тоҷикистон','en','Head office, Republic of Tajikistan') WHERE city->>'ru'='Душанбе';
UPDATE s2_centers SET city=city||jsonb_build_object('tg','Бохтар','en','Bokhtar'), address=address||jsonb_build_object('tg','вилояти Хатлон','en','Khatlon region') WHERE city->>'ru'='Бохтар';
UPDATE s2_centers SET city=city||jsonb_build_object('tg','Хуҷанд','en','Khujand'), address=address||jsonb_build_object('tg','вилояти Суғд','en','Sughd region') WHERE city->>'ru'='Худжанд';
UPDATE s2_centers SET city=city||jsonb_build_object('tg','Хоруғ','en','Khorog'), address=address||jsonb_build_object('tg','ВМКБ','en','GBAO') WHERE city->>'ru'='Хорог';

-- ---------------- COUNTRIES (справочный факт-контент, переводы) ----------------
UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Русия','en','Russia'),
  description = jsonb_build_object('code','RU',
    'short', jsonb_build_object('ru','Патент и трудовой договор','tg','Патент ва шартномаи меҳнатӣ','en','Patent and employment contract'),
    'tagline', jsonb_build_object('ru','Куда уезжает большинство — читать внимательно','tg','Ҷое ки аксарият меравад — бодиққат хонед','en','Where most people go — read carefully'),
    'earnings','60 000 – 90 000 ₽ / мес',
    'earnings_note', jsonb_build_object('ru','На руки после жилья и питания — ориентировочно 45 000 – 65 000 ₽','tg','Ба даст пас аз манзил ва хӯрок — тахминан 45 000 – 65 000 ₽','en','Take-home after housing and food — approx. 45,000–65,000 RUB'),
    'docs', jsonb_build_object('ru','Загранпаспорт, миграционная карта, патент, полис ДМС, регистрация в течение 7 дней','tg','Шиносномаи хориҷӣ, корти муҳоҷират, патент, суғуртаи тиббӣ, бақайдгирӣ дар 7 рӯз','en','Passport, migration card, patent, medical insurance, registration within 7 days'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Оформите загранпаспорт и получите патент','tg','Шиносномаи хориҷӣ гиред ва патент расмӣ кунед','en','Obtain a passport and get a patent'),
      jsonb_build_object('ru','Заключите официальный трудовой договор','tg','Шартномаи расмии меҳнатӣ банданд','en','Sign an official employment contract'),
      jsonb_build_object('ru','Пройдите медосмотр и дактилоскопию','tg','Аз муоинаи тиббӣ ва ангуштнигорӣ гузаред','en','Undergo medical examination and fingerprinting'),
      jsonb_build_object('ru','Встаньте на миграционный учёт по прибытии','tg','Пас аз омадан ба ҳисоби муҳоҷират биистед','en','Register for migration accounting upon arrival')),
    'note', jsonb_build_object('ru','Работайте только по патенту и договору. Без документов — риск штрафа и выдворения.','tg','Танҳо бо патент ва шартнома кор кунед. Бе ҳуҷҷат — хатари ҷарима ва ронда шудан.','en','Work only with a patent and contract. Without documents — risk of fines and deportation.')
  ) WHERE name->>'ru'='Россия';

UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Британияи Кабир','en','United Kingdom'),
  description = jsonb_build_object('code','UK',
    'short', jsonb_build_object('ru','Рабочая виза со спонсором','tg','Раводиди корӣ бо сарпараст','en','Work visa with a sponsor'),
    'tagline', jsonb_build_object('ru','Только по официальному приглашению работодателя','tg','Танҳо бо даъватномаи расмии корфармо','en','Only by official employer invitation'),
    'earnings','£1 600 – £2 400 / мес',
    'earnings_note', jsonb_build_object('ru','Высокая стоимость жизни — заранее уточните расходы на жильё','tg','Арзиши баланди зиндагӣ — хароҷоти манзилро пешакӣ равшан кунед','en','High cost of living — check housing costs in advance'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение (Certificate of Sponsorship), рабочая виза, знание английского','tg','Шиносномаи хориҷӣ, даъватнома (Certificate of Sponsorship), раводиди корӣ, донистани забони англисӣ','en','Passport, Certificate of Sponsorship, work visa, English proficiency'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Найдите работодателя с лицензией спонсора','tg','Корфармои дорои иҷозати сарпарастиро ёбед','en','Find an employer with a sponsor licence'),
      jsonb_build_object('ru','Получите Certificate of Sponsorship','tg','Certificate of Sponsorship гиред','en','Obtain a Certificate of Sponsorship'),
      jsonb_build_object('ru','Подайте документы на рабочую визу','tg','Ҳуҷҷатҳоро барои раводиди корӣ супоред','en','Apply for a work visa'),
      jsonb_build_object('ru','Пройдите биометрию и медосмотр','tg','Аз биометрия ва муоинаи тиббӣ гузаред','en','Complete biometrics and medical check')),
    'note', jsonb_build_object('ru','Виза оформляется только через лицензированного работодателя. Остерегайтесь фальшивых приглашений.','tg','Раводид танҳо тавассути корфармои иҷозатнокдор расмӣ мешавад. Аз даъватномаҳои сохта эҳтиёт шавед.','en','The visa is issued only through a licensed employer. Beware of fake invitations.')
  ) WHERE name->>'ru'='Великобритания';

UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Кореяи Ҷанубӣ','en','South Korea'),
  description = jsonb_build_object('code','KR',
    'short', jsonb_build_object('ru','Программа EPS','tg','Барномаи EPS','en','EPS programme'),
    'tagline', jsonb_build_object('ru','Трудоустройство по системе разрешений (EPS)','tg','Корёбӣ аз рӯи низоми иҷозатҳо (EPS)','en','Employment via the permit system (EPS)'),
    'earnings','₩2 000 000 – ₩2 600 000 / мес',
    'earnings_note', jsonb_build_object('ru','Требуется сдать экзамен по корейскому языку (EPS-TOPIK)','tg','Супоридани имтиҳони забони кореягӣ (EPS-TOPIK) талаб карда мешавад','en','Requires passing the Korean language exam (EPS-TOPIK)'),
    'docs', jsonb_build_object('ru','Загранпаспорт, сертификат EPS-TOPIK, медсправка, трудовой контракт','tg','Шиносномаи хориҷӣ, сертификати EPS-TOPIK, маълумотномаи тиббӣ, шартномаи меҳнатӣ','en','Passport, EPS-TOPIK certificate, medical certificate, employment contract'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Сдайте языковой экзамен EPS-TOPIK','tg','Имтиҳони забони EPS-TOPIK-ро супоред','en','Pass the EPS-TOPIK language exam'),
      jsonb_build_object('ru','Зарегистрируйтесь в системе EPS','tg','Дар низоми EPS бақайд гиред','en','Register in the EPS system'),
      jsonb_build_object('ru','Дождитесь выбора работодателем','tg','Интихоби корфарморо интизор шавед','en','Wait to be selected by an employer'),
      jsonb_build_object('ru','Оформите визу E-9 и выезжайте','tg','Раводиди E-9 расмӣ кунед ва сафар кунед','en','Obtain an E-9 visa and depart')),
    'note', jsonb_build_object('ru','Приём заявок — только через государственную программу EPS. Частные посредники не имеют права её оформлять.','tg','Қабули аризаҳо — танҳо тавассути барномаи давлатии EPS. Миёнаравҳои хусусӣ ҳуқуқи расмӣ карданро надоранд.','en','Applications are accepted only through the state EPS programme. Private intermediaries are not authorized to process it.')
  ) WHERE name->>'ru'='Южная Корея';

UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Лаҳистон','en','Poland'),
  description = jsonb_build_object('code','PL',
    'short', jsonb_build_object('ru','Рабочая виза (тип D)','tg','Раводиди корӣ (навъи D)','en','Work visa (type D)'),
    'tagline', jsonb_build_object('ru','Один из основных рынков труда в ЕС','tg','Яке аз бозорҳои асосии меҳнат дар ИА','en','One of the main labor markets in the EU'),
    'earnings','3 500 – 5 000 zł / мес',
    'earnings_note', jsonb_build_object('ru','Часто предоставляется жильё от работодателя','tg','Аксаран манзил аз ҷониби корфармо дода мешавад','en','Housing is often provided by the employer'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение на работу, рабочая виза D, страховка','tg','Шиносномаи хориҷӣ, даъватнома ба кор, раводиди корӣ D, суғурта','en','Passport, job invitation, type D work visa, insurance'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Получите приглашение (oświadczenie / zezwolenie)','tg','Даъватнома гиред (oświadczenie / zezwolenie)','en','Obtain an invitation (oświadczenie / zezwolenie)'),
      jsonb_build_object('ru','Подайте на национальную визу типа D','tg','Ба раводиди миллии навъи D ариза диҳед','en','Apply for a national type D visa'),
      jsonb_build_object('ru','Оформите медицинскую страховку','tg','Суғуртаи тиббӣ расмӣ кунед','en','Arrange medical insurance'),
      jsonb_build_object('ru','Пройдите собеседование в консульстве','tg','Дар консулгарӣ аз мусоҳиба гузаред','en','Attend an interview at the consulate')),
    'note', jsonb_build_object('ru','Проверяйте приглашение в реестре работодателей. Не платите за «гарантированное» трудоустройство.','tg','Даъватномаро дар феҳристи корфармоён санҷед. Барои корёбии «кафолатнок» пул надиҳед.','en','Verify the invitation in the employer registry. Do not pay for guaranteed employment.')
  ) WHERE name->>'ru'='Польша';

UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Латвия','en','Latvia'),
  description = jsonb_build_object('code','LV',
    'short', jsonb_build_object('ru','Рабочая виза (ЕС)','tg','Раводиди корӣ (ИА)','en','Work visa (EU)'),
    'tagline', jsonb_build_object('ru','Работа в странах Балтии по визе ЕС','tg','Кор дар кишварҳои Балтика бо раводиди ИА','en','Work in the Baltic states with an EU visa'),
    'earnings','€900 – €1 400 / мес',
    'earnings_note', jsonb_build_object('ru','Знание базового английского или русского приветствуется','tg','Донистани забони англисӣ ё русии ибтидоӣ хуш пазируфта мешавад','en','Basic English or Russian is welcome'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение работодателя, рабочая виза, страховка','tg','Шиносномаи хориҷӣ, даъватномаи корфармо, раводиди корӣ, суғурта','en','Passport, employer invitation, work visa, insurance'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Получите разрешение на трудоустройство','tg','Иҷозати корӣ гиред','en','Obtain a work permit'),
      jsonb_build_object('ru','Оформите национальную рабочую визу','tg','Раводиди миллии кориро расмӣ кунед','en','Arrange a national work visa'),
      jsonb_build_object('ru','Сделайте медицинскую страховку','tg','Суғуртаи тиббӣ кунед','en','Get medical insurance'),
      jsonb_build_object('ru','Зарегистрируйтесь по прибытии','tg','Пас аз омадан бақайд гиред','en','Register upon arrival')),
    'note', jsonb_build_object('ru','Убедитесь, что работодатель зарегистрирован официально и договор оформлен на латышском и понятном вам языке.','tg','Боварӣ ҳосил кунед, ки корфармо расман бақайд гирифта шудааст ва шартнома ба забони латишӣ ва барои шумо фаҳмо тартиб дода шудааст.','en','Make sure the employer is officially registered and the contract is in Latvian and a language you understand.')
  ) WHERE name->>'ru'='Латвия';

UPDATE s2_countries SET
  name = name || jsonb_build_object('tg','Олмон','en','Germany'),
  description = jsonb_build_object('code','DE',
    'short', jsonb_build_object('ru','Голубая карта / рабочая виза','tg','Корти кабуд / раводиди корӣ','en','Blue Card / work visa'),
    'tagline', jsonb_build_object('ru','Требуется квалификация и знание языка','tg','Тахассус ва донистани забон талаб карда мешавад','en','Qualification and language skills required'),
    'earnings','€2 200 – €3 200 / мес',
    'earnings_note', jsonb_build_object('ru','Нужно подтверждение квалификации и уровень немецкого A2–B1','tg','Тасдиқи тахассус ва сатҳи забони олмонии A2–B1 лозим аст','en','Qualification recognition and German level A2–B1 are needed'),
    'docs', jsonb_build_object('ru','Загранпаспорт, подтверждение диплома, трудовой договор, рабочая виза','tg','Шиносномаи хориҷӣ, тасдиқи диплом, шартномаи меҳнатӣ, раводиди корӣ','en','Passport, diploma recognition, employment contract, work visa'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Подтвердите квалификацию (Anerkennung)','tg','Тахассусро тасдиқ кунед (Anerkennung)','en','Confirm your qualification (Anerkennung)'),
      jsonb_build_object('ru','Найдите работодателя и договор','tg','Корфармо ва шартнома ёбед','en','Find an employer and contract'),
      jsonb_build_object('ru','Подайте на рабочую визу или Blue Card','tg','Ба раводиди корӣ ё Blue Card ариза диҳед','en','Apply for a work visa or Blue Card'),
      jsonb_build_object('ru','Пройдите собеседование в посольстве','tg','Дар сафорат аз мусоҳиба гузаред','en','Attend an interview at the embassy')),
    'note', jsonb_build_object('ru','Признание диплома обязательно для большинства профессий. Начните с проверки квалификации.','tg','Эътирофи диплом барои аксари касбҳо ҳатмист. Аз санҷиши тахассус оғоз кунед.','en','Diploma recognition is mandatory for most professions. Start by checking your qualification.')
  ) WHERE name->>'ru'='Германия';

-- ---------------- PAGES (переводы, факт-контент) ----------------
UPDATE s2_pages SET
  title = title || jsonb_build_object('tg','Дар бораи мо','en','About us'),
  hero_title = hero_title || jsonb_build_object('tg','Дар бораи мо','en','About us'),
  body = jsonb_build_object(
    'heading', jsonb_build_object('ru','Государственное учреждение «Центр внешней трудовой миграции и зарубежного трудоустройства»','tg','Муассисаи давлатии «Маркази муҳоҷирати меҳнатии хориҷӣ ва корёбии беруна»','en','State Institution "Center for External Labor Migration and Overseas Employment"'),
    'collage', COALESCE(body->'collage','["","","",""]'::jsonb),
    'goal_title', jsonb_build_object('ru','Наша цель','tg','Ҳадафи мо','en','Our goal'),
    'goal_subtitle', jsonb_build_object('ru','Легальное и безопасное трудоустройство граждан Таджикистана за рубежом','tg','Корёбии қонунӣ ва бехатари шаҳрвандони Тоҷикистон дар хориҷа','en','Legal and safe employment of Tajik citizens abroad'),
    'goal_text', jsonb_build_object('ru','Мы содействуем легальному трудоустройству граждан за рубежом, проверяем работодателей и защищаем права трудовых мигрантов на всех этапах — от подачи заявки до возвращения домой.','tg','Мо ба корёбии қонунии шаҳрвандон дар хориҷа мусоидат мекунем, корфармоёнро месанҷем ва ҳуқуқи муҳоҷирони меҳнатиро дар ҳама марҳилаҳо — аз супоридани ариза то бозгашт ба ватан — ҳимоя мекунем.','en','We facilitate the legal employment of citizens abroad, verify employers and protect the rights of labor migrants at every stage — from application to returning home.'),
    'list1_title', jsonb_build_object('ru','Наши услуги','tg','Хидматҳои мо','en','Our services'),
    'list1', jsonb_build_array(
      jsonb_build_object('ru','Проверка вакансий и работодателей за рубежом','tg','Санҷиши ҷойҳои корӣ ва корфармоён дар хориҷа','en','Verification of overseas vacancies and employers'),
      jsonb_build_object('ru','Консультации о легальном порядке выезда и трудоустройства','tg','Машварат оид ба тартиби қонунии сафар ва корёбӣ','en','Consultations on the legal procedure for departure and employment'),
      jsonb_build_object('ru','Помощь в подготовке документов и подаче на визу','tg','Кӯмак дар омода кардани ҳуҷҷатҳо ва пешниҳоди раводид','en','Help with document preparation and visa application'),
      jsonb_build_object('ru','Языковая подготовка и профориентация','tg','Омодагии забонӣ ва касбинтихобкунӣ','en','Language preparation and career guidance')),
    'list2_title', jsonb_build_object('ru','Поддержка после возвращения','tg','Дастгирӣ пас аз бозгашт','en','Support after returning'),
    'list2', jsonb_build_array(
      jsonb_build_object('ru','Признание квалификации, полученной за рубежом','tg','Эътирофи тахассуси дар хориҷа гирифташуда','en','Recognition of qualifications obtained abroad'),
      jsonb_build_object('ru','Содействие в трудоустройстве на родине','tg','Мусоидат дар корёбӣ дар ватан','en','Assistance with employment at home'))
  ) WHERE slug='o-nas';

UPDATE s2_pages SET
  title = title || jsonb_build_object('tg','Кор дар Олмон','en','Work in Germany'),
  hero_title = hero_title || jsonb_build_object('tg','Кор дар Олмон','en','Work in Germany'),
  body = jsonb_build_object(
    'intro', jsonb_build_object('ru','Германия принимает иностранных работников по государственным программам трудоустройства. Центр консультирует граждан Таджикистана по легальному порядку выезда, помогает подготовить документы и пройти обучение перед отъездом.','tg','Олмон коргарони хориҷиро аз рӯи барномаҳои давлатии корӣ қабул мекунад. Марказ шаҳрвандони Тоҷикистонро оид ба тартиби қонунии сафар машварат медиҳад, дар омода кардани ҳуҷҷатҳо ва гузаштани омӯзиш пеш аз сафар кӯмак мекунад.','en','Germany accepts foreign workers under state employment programs. The Center advises Tajik citizens on the legal departure procedure and helps prepare documents and complete pre-departure training.'),
    'facts', jsonb_build_array(
      jsonb_build_object('label',jsonb_build_object('ru','Средняя зарплата','tg','Музди миёна','en','Average salary'),'value',jsonb_build_object('ru','€2 200–3 200','tg','€2 200–3 200','en','€2 200–3 200'),'note',jsonb_build_object('ru','в месяц, до налогов','tg','дар як моҳ, то андоз','en','per month, before tax')),
      jsonb_build_object('label',jsonb_build_object('ru','Виза','tg','Раводид','en','Visa'),'value',jsonb_build_object('ru','Рабочая / Blue Card','tg','Кории / Blue Card','en','Work / Blue Card'),'note',jsonb_build_object('ru','виза типа D по приглашению','tg','раводиди навъи D бо даъватнома','en','type D visa by invitation')),
      jsonb_build_object('label',jsonb_build_object('ru','Язык','tg','Забон','en','Language'),'value',jsonb_build_object('ru','A2–B1','tg','A2–B1','en','A2–B1'),'note',jsonb_build_object('ru','немецкий','tg','олмонӣ','en','German')),
      jsonb_build_object('label',jsonb_build_object('ru','Контракт','tg','Шартнома','en','Contract'),'value',jsonb_build_object('ru','от 12 мес','tg','аз 12 моҳ','en','from 12 months'),'note',jsonb_build_object('ru','официальный договор','tg','шартномаи расмӣ','en','official contract'))),
    'help', jsonb_build_array(
      jsonb_build_object('ru','Консультация о легальном порядке выезда','tg','Машварат оид ба тартиби қонунии сафар','en','Consultation on the legal departure procedure'),
      jsonb_build_object('ru','Проверка работодателя и условий договора','tg','Санҷиши корфармо ва шартҳои шартнома','en','Checking the employer and contract terms'),
      jsonb_build_object('ru','Направление на языковые курсы','tg','Роҳхат ба курсҳои забон','en','Referral to language courses'),
      jsonb_build_object('ru','Помощь в подготовке документов','tg','Кӯмак дар омода кардани ҳуҷҷатҳо','en','Help preparing documents'),
      jsonb_build_object('ru','Выдача свидетельства о навыках','tg','Додани шаҳодатнома оид ба малакаҳо','en','Issuing a skills certificate')),
    'professions', jsonb_build_array(
      jsonb_build_object('ru','Уход за пожилыми','tg','Нигоҳубини калонсолон','en','Elderly care'),
      jsonb_build_object('ru','Медсёстры','tg','Ҳамширагон','en','Nurses'),
      jsonb_build_object('ru','Строители','tg','Сохтмончиён','en','Construction workers'),
      jsonb_build_object('ru','Сварщики','tg','Кафшергарон','en','Welders'),
      jsonb_build_object('ru','Электрики','tg','Электрикҳо','en','Electricians'),
      jsonb_build_object('ru','Водители','tg','Ронандагон','en','Drivers'),
      jsonb_build_object('ru','Повара','tg','Ошпазҳо','en','Cooks'),
      jsonb_build_object('ru','Логистика','tg','Логистика','en','Logistics')),
    'language_note', jsonb_build_object('ru','Для большинства профессий требуется немецкий A2–B1. Центр направляет на языковые курсы перед выездом.','tg','Барои аксари касбҳо забони олмонии A2–B1 лозим аст. Марказ пеш аз сафар ба курсҳои забон роҳхат медиҳад.','en','Most professions require German A2–B1. The Center refers to language courses before departure.'),
    'steps', jsonb_build_array(
      jsonb_build_object('n','01','title',jsonb_build_object('ru','Регистрация','tg','Бақайдгирӣ','en','Registration'),'desc',jsonb_build_object('ru','Обратитесь в Центр и подайте заявку','tg','Ба Марказ муроҷиат кунед ва ариза супоред','en','Contact the Center and submit an application')),
      jsonb_build_object('n','02','title',jsonb_build_object('ru','Подготовка','tg','Омодагӣ','en','Preparation'),'desc',jsonb_build_object('ru','Язык, профориентация, навыки','tg','Забон, касбинтихобкунӣ, малакаҳо','en','Language, career guidance, skills')),
      jsonb_build_object('n','03','title',jsonb_build_object('ru','Работодатель','tg','Корфармо','en','Employer'),'desc',jsonb_build_object('ru','Подбор вакансии и приглашение','tg','Интихоби ҷои корӣ ва даъватнома','en','Job matching and invitation')),
      jsonb_build_object('n','04','title',jsonb_build_object('ru','Виза','tg','Раводид','en','Visa'),'desc',jsonb_build_object('ru','Подача на визу или Blue Card','tg','Пешниҳод ба раводид ё Blue Card','en','Applying for a visa or Blue Card')),
      jsonb_build_object('n','05','title',jsonb_build_object('ru','Выезд','tg','Сафар','en','Departure'),'desc',jsonb_build_object('ru','Легальный выезд и сопровождение','tg','Сафари қонунӣ ва ҳамроҳӣ','en','Legal departure and support'))),
    'documents', jsonb_build_array(
      jsonb_build_object('ru','Загранпаспорт','tg','Шиносномаи хориҷӣ','en','Passport'),
      jsonb_build_object('ru','Подтверждение квалификации (Anerkennung)','tg','Тасдиқи тахассус (Anerkennung)','en','Qualification recognition (Anerkennung)'),
      jsonb_build_object('ru','Трудовой договор или приглашение','tg','Шартномаи меҳнатӣ ё даъватнома','en','Employment contract or invitation'),
      jsonb_build_object('ru','Сертификат немецкого языка (A2–B1)','tg','Сертификати забони олмонӣ (A2–B1)','en','German language certificate (A2–B1)'),
      jsonb_build_object('ru','Медицинская страховка','tg','Суғуртаи тиббӣ','en','Medical insurance')),
    'warning_title', jsonb_build_object('ru','Никому не платите за трудоустройство','tg','Барои корёбӣ ба касе пул надиҳед','en','Do not pay anyone for employment'),
    'warning_text', jsonb_build_object('ru','Все услуги Центра бесплатны. Рабочая виза оформляется только через лицензированного работодателя. Остерегайтесь посредников, обещающих «гарантированное» место за деньги.','tg','Ҳамаи хидматҳои Марказ ройгонанд. Раводиди корӣ танҳо тавассути корфармои иҷозатнокдор расмӣ мешавад. Аз миёнаравҳое, ки ҷои «кафолатнок»-ро барои пул ваъда медиҳанд, эҳтиёт шавед.','en','All Center services are free. A work visa is issued only through a licensed employer. Beware of intermediaries promising a guaranteed place for money.')
  ) WHERE slug='rabota-v-germanii';

COMMIT;
