-- ============================================================
--  Наполнение контента САЙТА 1 (s1_*) переводами tg/en.
--  Демонстрационные данные для видимого переключения языков.
--  Затрагивает ТОЛЬКО s1_* (site2 не трогаем). Идемпотентно (перезапись).
--  Запуск: docker compose exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB < scripts/i18n_fill_s1.sql
-- ============================================================
BEGIN;

-- ---------------- SETTINGS ----------------
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Марказҳои машваратӣ ва омодасозии муҳоҷирони меҳнатӣ пеш аз сафар','en','Centers for Counseling and Pre-Departure Preparation of Labor Migrants') WHERE key='site_title';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Муассисаи давлатӣ','en','State Institution') WHERE key='site_subtitle';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Муассисаи давлатӣ · Ҷумҳурии Тоҷикистон','en','State Institution · Republic of Tajikistan') WHERE key='org_status';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Президенти Ҷумҳурии Тоҷикистон','en','President of the Republic of Tajikistan') WHERE key='president_label';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Паёмҳо ва суханрониҳои Асосгузори сулҳу ваҳдати миллӣ — Пешвои миллат','en','Messages and speeches of the Founder of Peace and National Unity — Leader of the Nation') WHERE key='president_caption';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Барои хидматҳои мо ба касе пул надиҳед','en','Do not pay anyone for our services') WHERE key='warning_title';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Маркази давлатӣ ҳеҷ гоҳ пул намегирад. Агар касе ваъда диҳад, ки шуморо «тавассути Марказ» ба кор медарорад — ин фиреб аст. Ба миёнаравҳо пул, шиноснома ё ҳуҷҷатҳоятонро надиҳед. Аввал аз мо санҷед.','en','The state Center never charges money. If someone promises to employ you "through the Center" for a fee, it is a scam. Do not give intermediaries money, your passport or documents. Check with us first.') WHERE key='warning_text';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Чӣ гуна фиребро шинохтан','en','How to recognize fraud') WHERE key='warning_link';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Дар Марказ бақайдгирӣ шавед','en','Register at the Center') WHERE key='register_title';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Дастрасии пурра ба хидматҳои Марказ, маълумоти навтарин ва дастгирӣ дар ҳар марҳила. Ройгон, маълумоти шумо таҳти ҳимояи давлат.','en','Full access to the Center services, up-to-date information and support at every stage. Free, your data is protected by the state.') WHERE key='register_text';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Телеграми мо','en','Our Telegram') WHERE key='telegram_title';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Ба Телеграми мо ҳамроҳ шавед — саволҳо диҳед ва аз Марказ ҷавоб гиред.','en','Join our Telegram — ask questions and get answers from the Center.') WHERE key='telegram_text';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','ш. Душанбе, Ҷумҳурии Тоҷикистон','en','Dushanbe, Republic of Tajikistan') WHERE key='address';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','© 2026 Муассисаи давлатии «Марказҳои машваратӣ ва омодасозии муҳоҷирони меҳнатӣ пеш аз сафар»','en','© 2026 State Institution "Centers for Counseling and Pre-Departure Preparation of Labor Migrants"') WHERE key='copyright';
UPDATE s1_settings SET value = value || jsonb_build_object('tg','Ҳуқуқҳо ҳимоя шудаанд © Ҳамаи ҳуқуқҳо ҳифз шудаанд 2026','en','All rights reserved © 2026') WHERE key='footer_copyright';

-- ---------------- SLIDERS ----------------
UPDATE s1_sliders SET
  title = title || jsonb_build_object('tg','Ба кор ба хориҷа рафтанӣ ҳастед? Аз қадами бехатар оғоз кунед.','en','Going to work abroad? Start with a safe step.'),
  subtitle = subtitle || jsonb_build_object('tg','Мо — Маркази давлатӣ. Ба шаҳрвандони Тоҷикистон барои қонунӣ ва бехатар ба кор рафтан кӯмак мекунем.','en','We are a state Center. We help citizens of Tajikistan go to work legally and safely.'),
  cta_label = cta_label || jsonb_build_object('tg','Аз куҷо оғоз карданро бидонед →','en','Find out where to start →')
  WHERE sort_order=0;
UPDATE s1_sliders SET
  title = title || jsonb_build_object('tg','Корфармоёни санҷидашуда ва шароити одилонаи меҳнат дар хориҷа.','en','Verified employers and fair working conditions abroad.'),
  subtitle = subtitle || jsonb_build_object('tg','Ҳар як ҷои корӣ санҷида мешавад. Ҳеҷ миёнарав ва пардохти пинҳонӣ — танҳо роҳҳои қонунии корёбӣ.','en','Every vacancy is verified. No intermediaries or hidden fees — only legal employment channels.'),
  cta_label = cta_label || jsonb_build_object('tg','Кишварҳоро дидан →','en','View countries →')
  WHERE sort_order=1;
UPDATE s1_sliders SET
  title = title || jsonb_build_object('tg','Худро фиреб надиҳед. Дар Маркази давлатӣ машварат гиред.','en','Do not get deceived. Consult at the state Center.'),
  subtitle = subtitle || jsonb_build_object('tg','Машварати ройгон, кӯмак дар омодасозии ҳуҷҷатҳо ва ҳимояи ҳуқуқҳои шумо дар ҳама марҳилаҳо.','en','Free consultations, help with documents and protection of your rights at all stages.'),
  cta_label = cta_label || jsonb_build_object('tg','Машварат гирифтан →','en','Get a consultation →')
  WHERE sort_order=2;

-- ---------------- HELP ITEMS ----------------
UPDATE s1_help_items SET title=title||jsonb_build_object('tg','Дар бораи кишвар ҳақиқатро мефаҳмед','en','Learn the truth about the country'), description=description||jsonb_build_object('tg','Пас аз ҳама харочот воқеан чӣ қадар пул мемонад ва дар ҷои кор чӣ интизори шумост','en','How much money really remains after all expenses and what awaits you there') WHERE icon='🔎';
UPDATE s1_help_items SET title=title||jsonb_build_object('tg','Ҳуҷҷатҳоро ҷамъ мекунед','en','Gather your documents'), description=description||jsonb_build_object('tg','Кӯмак мекунем фаҳмед, ки кадом ҳуҷҷатҳо лозиманд ва онҳоро дуруст омода кунед','en','We help you understand which papers are needed and prepare them correctly') WHERE icon='📋';
UPDATE s1_help_items SET title=title||jsonb_build_object('tg','Омодагӣ мегузаред','en','Complete preparation'), description=description||jsonb_build_object('tg','Омӯзиш пеш аз сафар, то шумо ба кор омода равед','en','Pre-departure training so you leave ready to work') WHERE icon='🎓';
UPDATE s1_help_items SET title=title||jsonb_build_object('tg','Шаҳодатнома мегиред','en','Receive a certificate'), description=description||jsonb_build_object('tg','Ҳуҷҷат дар бораи малакаҳо — ҳам дар хориҷа ва ҳам дар ватан ба кор меояд','en','A skills certificate — useful both abroad and at home') WHERE icon='📜';

-- ---------------- NEWS (titles) ----------------
UPDATE s1_news SET title=title||jsonb_build_object('tg','Кори иттилоотию маърифатӣ дар шаҳри Исфара','en','Information and awareness work in the city of Isfara') WHERE slug='info-isfara';
UPDATE s1_news SET title=title||jsonb_build_object('tg','Гузаронидани кори иттилоотию маърифатӣ дар шаҳри Конибодом','en','Information and awareness work in the city of Kanibadam') WHERE slug='info-kanibadam';
UPDATE s1_news SET title=title||jsonb_build_object('tg','Ярмаркаи ҷойҳои холии корӣ дар Маркази ноҳияи Темурмалик','en','Job fair at the Center of Temurmalik district') WHERE slug='fair-temurmalik';
UPDATE s1_news SET title=title||jsonb_build_object('tg','Вохӯрӣ бо сокинони ҷамоати Понғози ноҳияи Ашт','en','Meeting with residents of Pongoz jamoat, Asht district') WHERE slug='meeting-pongoz';
UPDATE s1_news SET title=title||jsonb_build_object('tg','Курси омӯзишӣ пеш аз сафар: малакаҳои амалӣ','en','Pre-departure training course: practical skills') WHERE slug='course-before-departure';
UPDATE s1_news SET title=title||jsonb_build_object('tg','Эҳтиёт шавед: фиребгарон дар ниқоби кормандони Марказ','en','Warning: fraudsters posing as Center staff') WHERE slug='warning-fraud';

-- ---------------- CENTERS ----------------
UPDATE s1_centers SET city=city||jsonb_build_object('tg','Душанбе','en','Dushanbe'), address=address||jsonb_build_object('tg','Маркази марказӣ, Ҷумҳурии Тоҷикистон','en','Head office, Republic of Tajikistan') WHERE city->>'ru'='Душанбе';
UPDATE s1_centers SET city=city||jsonb_build_object('tg','Бохтар','en','Bokhtar'), address=address||jsonb_build_object('tg','вилояти Хатлон','en','Khatlon region') WHERE city->>'ru'='Бохтар';
UPDATE s1_centers SET city=city||jsonb_build_object('tg','Хуҷанд','en','Khujand'), address=address||jsonb_build_object('tg','вилояти Суғд','en','Sughd region') WHERE city->>'ru'='Худжанд';
UPDATE s1_centers SET city=city||jsonb_build_object('tg','Хоруғ','en','Khorog'), address=address||jsonb_build_object('tg','ВМКБ','en','GBAO') WHERE city->>'ru'='Хорог';

-- ---------------- COUNTRIES ----------------
UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Русия','en','Russia'),
  description = jsonb_build_object(
    'code','RU',
    'short', jsonb_build_object('ru','Патент и трудовой договор','tg','Патент ва шартномаи меҳнатӣ','en','Patent and employment contract'),
    'tagline', jsonb_build_object('ru','Куда уезжает большинство — читать внимательно','tg','Ҷое ки аксарият меравад — бодиққат хонед','en','Where most people go — read carefully'),
    'earnings','60 000 – 90 000 ₽ / мес',
    'earnings_note', jsonb_build_object('ru','На руки после жилья и питания — ориентировочно 45 000 – 65 000 ₽','tg','Ба даст пас аз манзил ва хӯрок — тахминан 45 000 – 65 000 ₽','en','Take-home after housing and food — approx. 45,000–65,000 RUB'),
    'docs', jsonb_build_object('ru','Загранпаспорт, миграционная карта, патент, полис ДМС, регистрация в течение 7 дней','tg','Шиносномаи хориҷӣ, корти муҳоҷират, патент, суғуртаи тиббӣ, бақайдгирӣ дар 7 рӯз','en','Passport, migration card, patent, medical insurance, registration within 7 days'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Оформите загранпаспорт и получите патент','tg','Шиносномаи хориҷӣ гиред ва патент расмӣ кунед','en','Obtain a passport and get a patent'),
      jsonb_build_object('ru','Заключите официальный трудовой договор','tg','Шартномаи расмии меҳнатӣ банданд','en','Sign an official employment contract'),
      jsonb_build_object('ru','Пройдите медосмотр и дактилоскопию','tg','Аз муоинаи тиббӣ ва ангуштнигорӣ гузаред','en','Undergo medical examination and fingerprinting'),
      jsonb_build_object('ru','Встаньте на миграционный учёт по прибытии','tg','Пас аз омадан ба ҳисоби муҳоҷират биистед','en','Register for migration accounting upon arrival')
    ),
    'note', jsonb_build_object('ru','Работайте только по патенту и договору. Без документов — риск штрафа и выдворения.','tg','Танҳо бо патент ва шартнома кор кунед. Бе ҳуҷҷат — хатари ҷарима ва ронда шудан.','en','Work only with a patent and contract. Without documents — risk of fines and deportation.')
  ) WHERE name->>'ru'='Россия';

UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Британияи Кабир','en','United Kingdom'),
  description = jsonb_build_object(
    'code','UK',
    'short', jsonb_build_object('ru','Рабочая виза со спонсором','tg','Раводиди корӣ бо сарпараст','en','Work visa with a sponsor'),
    'tagline', jsonb_build_object('ru','Только по официальному приглашению работодателя','tg','Танҳо бо даъватномаи расмии корфармо','en','Only by official employer invitation'),
    'earnings','£1 600 – £2 400 / мес',
    'earnings_note', jsonb_build_object('ru','Высокая стоимость жизни — заранее уточните расходы на жильё','tg','Арзиши баланди зиндагӣ — хароҷоти манзилро пешакӣ равшан кунед','en','High cost of living — check housing costs in advance'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение (Certificate of Sponsorship), рабочая виза, знание английского','tg','Шиносномаи хориҷӣ, даъватнома (Certificate of Sponsorship), раводиди корӣ, донистани забони англисӣ','en','Passport, Certificate of Sponsorship, work visa, English proficiency'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Найдите работодателя с лицензией спонсора','tg','Корфармои дорои иҷозати сарпарастиро ёбед','en','Find an employer with a sponsor licence'),
      jsonb_build_object('ru','Получите Certificate of Sponsorship','tg','Certificate of Sponsorship гиред','en','Obtain a Certificate of Sponsorship'),
      jsonb_build_object('ru','Подайте документы на рабочую визу','tg','Ҳуҷҷатҳоро барои раводиди корӣ супоред','en','Apply for a work visa'),
      jsonb_build_object('ru','Пройдите биометрию и медосмотр','tg','Аз биометрия ва муоинаи тиббӣ гузаред','en','Complete biometrics and medical check')
    ),
    'note', jsonb_build_object('ru','Виза оформляется только через лицензированного работодателя. Остерегайтесь фальшивых приглашений.','tg','Раводид танҳо тавассути корфармои иҷозатнокдор расмӣ мешавад. Аз даъватномаҳои сохта эҳтиёт шавед.','en','The visa is issued only through a licensed employer. Beware of fake invitations.')
  ) WHERE name->>'ru'='Великобритания';

UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Кореяи Ҷанубӣ','en','South Korea'),
  description = jsonb_build_object(
    'code','KR',
    'short', jsonb_build_object('ru','Программа EPS','tg','Барномаи EPS','en','EPS programme'),
    'tagline', jsonb_build_object('ru','Трудоустройство по системе разрешений (EPS)','tg','Корёбӣ аз рӯи низоми иҷозатҳо (EPS)','en','Employment via the permit system (EPS)'),
    'earnings','₩2 000 000 – ₩2 600 000 / мес',
    'earnings_note', jsonb_build_object('ru','Требуется сдать экзамен по корейскому языку (EPS-TOPIK)','tg','Супоридани имтиҳони забони кореягӣ (EPS-TOPIK) талаб карда мешавад','en','Requires passing the Korean language exam (EPS-TOPIK)'),
    'docs', jsonb_build_object('ru','Загранпаспорт, сертификат EPS-TOPIK, медсправка, трудовой контракт','tg','Шиносномаи хориҷӣ, сертификати EPS-TOPIK, маълумотномаи тиббӣ, шартномаи меҳнатӣ','en','Passport, EPS-TOPIK certificate, medical certificate, employment contract'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Сдайте языковой экзамен EPS-TOPIK','tg','Имтиҳони забони EPS-TOPIK-ро супоред','en','Pass the EPS-TOPIK language exam'),
      jsonb_build_object('ru','Зарегистрируйтесь в системе EPS','tg','Дар низоми EPS бақайд гиред','en','Register in the EPS system'),
      jsonb_build_object('ru','Дождитесь выбора работодателем','tg','Интихоби корфарморо интизор шавед','en','Wait to be selected by an employer'),
      jsonb_build_object('ru','Оформите визу E-9 и выезжайте','tg','Раводиди E-9 расмӣ кунед ва сафар кунед','en','Obtain an E-9 visa and depart')
    ),
    'note', jsonb_build_object('ru','Приём заявок — только через государственную программу EPS. Частные посредники не имеют права её оформлять.','tg','Қабули аризаҳо — танҳо тавассути барномаи давлатии EPS. Миёнаравҳои хусусӣ ҳуқуқи расмӣ карданро надоранд.','en','Applications are accepted only through the state EPS programme. Private intermediaries are not authorized to process it.')
  ) WHERE name->>'ru'='Южная Корея';

UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Лаҳистон','en','Poland'),
  description = jsonb_build_object(
    'code','PL',
    'short', jsonb_build_object('ru','Рабочая виза (тип D)','tg','Раводиди корӣ (навъи D)','en','Work visa (type D)'),
    'tagline', jsonb_build_object('ru','Один из основных рынков труда в ЕС','tg','Яке аз бозорҳои асосии меҳнат дар ИА','en','One of the main labor markets in the EU'),
    'earnings','3 500 – 5 000 zł / мес',
    'earnings_note', jsonb_build_object('ru','Часто предоставляется жильё от работодателя','tg','Аксаран манзил аз ҷониби корфармо дода мешавад','en','Housing is often provided by the employer'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение на работу, рабочая виза D, страховка','tg','Шиносномаи хориҷӣ, даъватнома ба кор, раводиди корӣ D, суғурта','en','Passport, job invitation, type D work visa, insurance'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Получите приглашение (oświadczenie / zezwolenie)','tg','Даъватнома гиред (oświadczenie / zezwolenie)','en','Obtain an invitation (oświadczenie / zezwolenie)'),
      jsonb_build_object('ru','Подайте на национальную визу типа D','tg','Ба раводиди миллии навъи D ариза диҳед','en','Apply for a national type D visa'),
      jsonb_build_object('ru','Оформите медицинскую страховку','tg','Суғуртаи тиббӣ расмӣ кунед','en','Arrange medical insurance'),
      jsonb_build_object('ru','Пройдите собеседование в консульстве','tg','Дар консулгарӣ аз мусоҳиба гузаред','en','Attend an interview at the consulate')
    ),
    'note', jsonb_build_object('ru','Проверяйте приглашение в реестре работодателей. Не платите за «гарантированное» трудоустройство.','tg','Даъватномаро дар феҳристи корфармоён санҷед. Барои корёбии «кафолатнок» пул надиҳед.','en','Verify the invitation in the employer registry. Do not pay for guaranteed employment.')
  ) WHERE name->>'ru'='Польша';

UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Латвия','en','Latvia'),
  description = jsonb_build_object(
    'code','LV',
    'short', jsonb_build_object('ru','Рабочая виза (ЕС)','tg','Раводиди корӣ (ИА)','en','Work visa (EU)'),
    'tagline', jsonb_build_object('ru','Работа в странах Балтии по визе ЕС','tg','Кор дар кишварҳои Балтика бо раводиди ИА','en','Work in the Baltic states with an EU visa'),
    'earnings','€900 – €1 400 / мес',
    'earnings_note', jsonb_build_object('ru','Знание базового английского или русского приветствуется','tg','Донистани забони англисӣ ё русии ибтидоӣ хуш пазируфта мешавад','en','Basic English or Russian is welcome'),
    'docs', jsonb_build_object('ru','Загранпаспорт, приглашение работодателя, рабочая виза, страховка','tg','Шиносномаи хориҷӣ, даъватномаи корфармо, раводиди корӣ, суғурта','en','Passport, employer invitation, work visa, insurance'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Получите разрешение на трудоустройство','tg','Иҷозати корӣ гиред','en','Obtain a work permit'),
      jsonb_build_object('ru','Оформите национальную рабочую визу','tg','Раводиди миллии кориро расмӣ кунед','en','Arrange a national work visa'),
      jsonb_build_object('ru','Сделайте медицинскую страховку','tg','Суғуртаи тиббӣ кунед','en','Get medical insurance'),
      jsonb_build_object('ru','Зарегистрируйтесь по прибытии','tg','Пас аз омадан бақайд гиред','en','Register upon arrival')
    ),
    'note', jsonb_build_object('ru','Убедитесь, что работодатель зарегистрирован официально и договор оформлен на латышском и понятном вам языке.','tg','Боварӣ ҳосил кунед, ки корфармо расман бақайд гирифта шудааст ва шартнома ба забони латишӣ ва барои шумо фаҳмо тартиб дода шудааст.','en','Make sure the employer is officially registered and the contract is in Latvian and a language you understand.')
  ) WHERE name->>'ru'='Латвия';

UPDATE s1_countries SET
  name = name || jsonb_build_object('tg','Олмон','en','Germany'),
  description = jsonb_build_object(
    'code','DE',
    'short', jsonb_build_object('ru','Голубая карта / рабочая виза','tg','Корти кабуд / раводиди корӣ','en','Blue Card / work visa'),
    'tagline', jsonb_build_object('ru','Требуется квалификация и знание языка','tg','Тахассус ва донистани забон талаб карда мешавад','en','Qualification and language skills required'),
    'earnings','€2 200 – €3 200 / мес',
    'earnings_note', jsonb_build_object('ru','Нужно подтверждение квалификации и уровень немецкого A2–B1','tg','Тасдиқи тахассус ва сатҳи забони олмонии A2–B1 лозим аст','en','Qualification recognition and German level A2–B1 are needed'),
    'docs', jsonb_build_object('ru','Загранпаспорт, подтверждение диплома, трудовой договор, рабочая виза','tg','Шиносномаи хориҷӣ, тасдиқи диплом, шартномаи меҳнатӣ, раводиди корӣ','en','Passport, diploma recognition, employment contract, work visa'),
    'steps', jsonb_build_array(
      jsonb_build_object('ru','Подтвердите квалификацию (Anerkennung)','tg','Тахассусро тасдиқ кунед (Anerkennung)','en','Confirm your qualification (Anerkennung)'),
      jsonb_build_object('ru','Найдите работодателя и договор','tg','Корфармо ва шартнома ёбед','en','Find an employer and contract'),
      jsonb_build_object('ru','Подайте на рабочую визу или Blue Card','tg','Ба раводиди корӣ ё Blue Card ариза диҳед','en','Apply for a work visa or Blue Card'),
      jsonb_build_object('ru','Пройдите собеседование в посольстве','tg','Дар сафорат аз мусоҳиба гузаред','en','Attend an interview at the embassy')
    ),
    'note', jsonb_build_object('ru','Признание диплома обязательно для большинства профессий. Начните с проверки квалификации.','tg','Эътирофи диплом барои аксари касбҳо ҳатмист. Аз санҷиши тахассус оғоз кунед.','en','Diploma recognition is mandatory for most professions. Start by checking your qualification.')
  ) WHERE name->>'ru'='Германия';

-- ---------------- PAGE: О НАС ----------------
UPDATE s1_pages SET
  title = title || jsonb_build_object('tg','Дар бораи мо','en','About us'),
  hero_title = hero_title || jsonb_build_object('tg','Дар бораи мо','en','About us'),
  body = jsonb_build_object(
    'heading', jsonb_build_object('ru','Государственное учреждение «Центры консультирования и предвыездной подготовки трудовых мигрантов»','tg','Муассисаи давлатии «Марказҳои машваратӣ ва омодасозии пеш аз сафари муҳоҷирони меҳнатӣ»','en','State Institution "Centers for Counseling and Pre-Departure Preparation of Labor Migrants"'),
    'collage', COALESCE(body->'collage','["","","",""]'::jsonb),
    'goal_title', jsonb_build_object('ru','Наша цель','tg','Ҳадафи мо','en','Our goal'),
    'goal_subtitle', jsonb_build_object('ru','Обеспечение полной готовности граждан Таджикистана к безопасной миграции за рубеж','tg','Таъмини омодагии пурраи шаҳрвандони Тоҷикистон ба муҳоҷирати бехатар ба хориҷа','en','Ensuring full readiness of Tajik citizens for safe migration abroad'),
    'goal_text', jsonb_build_object('ru','Обеспечение полной готовности граждан Таджикистана к безопасной миграции за рубеж. Центры функционируют в городах Душанбе, Бохтар, Худжанд и Хорог. Мы планируем открыть новые центры в городах Куляб, Вахдат, Гиссар и Дангара и расширить их число.','tg','Таъмини омодагии пурраи шаҳрвандони Тоҷикистон ба муҳоҷирати бехатар ба хориҷа. Марказҳо дар шаҳрҳои Душанбе, Бохтар, Хуҷанд ва Хоруғ фаъолият мекунанд. Мо ба нақша дорем марказҳои нав дар шаҳрҳои Кӯлоб, Ваҳдат, Ҳисор ва Данғара кушоем ва шумораи онҳоро зиёд намоем.','en','Ensuring full readiness of Tajik citizens for safe migration abroad. Centers operate in Dushanbe, Bokhtar, Khujand and Khorog. We plan to open new centers in Kulob, Vahdat, Hisor and Danghara and expand their number.'),
    'list1_title', jsonb_build_object('ru','Повышение уровня образования граждан','tg','Баланд бардоштани сатҳи маърифати шаҳрвандон','en','Raising the education level of citizens'),
    'list1', jsonb_build_array(
      jsonb_build_object('ru','Проводить консультации и информационные сессии для потенциальных иммигрантов о странах назначения и вариантах иммиграции. Проведение целевых тренингов для граждан Таджикистана, принятых на работу в Великобританию по программе «Сезонные работники».','tg','Гузаронидани машваратҳо ва ҷаласаҳои иттилоотӣ барои муҳоҷирони эҳтимолӣ дар бораи кишварҳои таъинот ва имконоти муҳоҷират. Гузаронидани тренингҳои мақсаднок барои шаҳрвандони Тоҷикистон, ки ба кор дар Британияи Кабир аз рӯи барномаи «Коргарони мавсимӣ» қабул шудаанд.','en','Conducting consultations and information sessions for potential migrants about destination countries and migration options. Targeted training for Tajik citizens hired to work in the UK under the Seasonal Workers programme.'),
      jsonb_build_object('ru','Возвращение граждан в «Центр образования взрослых» для прохождения обучения и получения Свидетельства о подтверждении профессиональных навыков','tg','Бозгашти шаҳрвандон ба «Маркази таҳсилоти калонсолон» барои гузаштани омӯзиш ва гирифтани Шаҳодатнома оид ба тасдиқи малакаҳои касбӣ','en','Referring citizens to the Adult Education Center for training and obtaining a Certificate confirming professional skills'),
      jsonb_build_object('ru','Исследование рынка труда стран, принимающих трудовых мигрантов','tg','Омӯзиши бозори меҳнати кишварҳое, ки муҳоҷирони меҳнатиро қабул мекунанд','en','Studying the labor market of countries receiving labor migrants'),
      jsonb_build_object('ru','Приём граждан, ищущих работу, в языковые секции','tg','Қабули шаҳрвандони ҷӯяндаи кор ба бахшҳои забономӯзӣ','en','Enrolling job-seeking citizens in language sections'),
      jsonb_build_object('ru','Направление абитуриентов в «Центр образования взрослых» на прохождение профориентационных разделов','tg','Роҳхат додани довталабон ба «Маркази таҳсилоти калонсолон» барои гузаштани бахшҳои касбинтихобкунӣ','en','Referring applicants to the Adult Education Center for career-guidance sections'),
      jsonb_build_object('ru','Граждане, которые ищут работу','tg','Шаҳрвандоне, ки кор меҷӯянд','en','Citizens who are looking for work'),
      jsonb_build_object('ru','Приём абитуриентов на языковые курсы','tg','Қабули довталабон ба курсҳои забономӯзӣ','en','Enrolling applicants in language courses')
    ),
    'list2_title', jsonb_build_object('ru','2. Поддержка возвращающихся мигрантов и их дальнейшая деятельность','tg','2. Дастгирии муҳоҷирони бозгашта ва фаъолияти минбаъдаи онҳо','en','2. Support for returning migrants and their further activities'),
    'list2', jsonb_build_array(
      jsonb_build_object('ru','Медицинское обследование (инфекционные заболевания, такие как ВИЧ/СПИД/туберкулёз)','tg','Муоинаи тиббӣ (бемориҳои сироятӣ, ба монанди ВНМО/БПНМ/сил)','en','Medical examination (infectious diseases such as HIV/AIDS/tuberculosis)'),
      jsonb_build_object('ru','Возвращение граждан в «Центр образования взрослых» для прохождения обучения и получения сертификата об утверждении навыков, приобретённых в профессиях в государствах назначения','tg','Бозгашти шаҳрвандон ба «Маркази таҳсилоти калонсолон» барои омӯзиш ва гирифтани сертификати тасдиқи малакаҳои дар касбҳо дар кишварҳои таъинот бадастомада','en','Referring citizens to the Adult Education Center for training and a certificate confirming skills acquired in professions in destination countries')
    )
  ) WHERE slug='o-nas';

-- ---------------- PAGE: РАБОТА В ГЕРМАНИИ ----------------
UPDATE s1_pages SET
  title = title || jsonb_build_object('tg','Кор дар Олмон','en','Work in Germany'),
  hero_title = hero_title || jsonb_build_object('tg','Кор дар Олмон','en','Work in Germany'),
  body = jsonb_build_object(
    'intro', jsonb_build_object('ru','Германия принимает иностранных работников по государственным программам трудоустройства. Центр консультирует граждан Таджикистана по легальному порядку выезда, помогает подготовить документы и пройти обучение перед отъездом. Ниже — что важно знать и с чего начать.','tg','Олмон коргарони хориҷиро аз рӯи барномаҳои давлатии корӣ қабул мекунад. Марказ шаҳрвандони Тоҷикистонро оид ба тартиби қонунии сафар машварат медиҳад, дар омода кардани ҳуҷҷатҳо ва гузаштани омӯзиш пеш аз сафар кӯмак мекунад. Дар поён — он чи муҳим аст ва аз куҷо оғоз кардан.','en','Germany accepts foreign workers under state employment programs. The Center advises Tajik citizens on the legal departure procedure, helps prepare documents and complete pre-departure training. Below is what to know and where to start.'),
    'facts', jsonb_build_array(
      jsonb_build_object('label',jsonb_build_object('ru','Средняя зарплата','tg','Музди миёна','en','Average salary'),'value',jsonb_build_object('ru','€2 200–3 200','tg','€2 200–3 200','en','€2 200–3 200'),'note',jsonb_build_object('ru','в месяц, до налогов, зависит от сферы','tg','дар як моҳ, то андоз, вобаста ба соҳа','en','per month, before tax, depends on the field')),
      jsonb_build_object('label',jsonb_build_object('ru','Виза','tg','Раводид','en','Visa'),'value',jsonb_build_object('ru','Рабочая / Blue Card','tg','Кории / Blue Card','en','Work / Blue Card'),'note',jsonb_build_object('ru','национальная виза типа D по приглашению','tg','раводиди миллии навъи D бо даъватнома','en','national type D visa by invitation')),
      jsonb_build_object('label',jsonb_build_object('ru','Язык','tg','Забон','en','Language'),'value',jsonb_build_object('ru','A2–B1','tg','A2–B1','en','A2–B1'),'note',jsonb_build_object('ru','немецкий, для большинства профессий','tg','олмонӣ, барои аксари касбҳо','en','German, for most professions')),
      jsonb_build_object('label',jsonb_build_object('ru','Контракт','tg','Шартнома','en','Contract'),'value',jsonb_build_object('ru','от 12 мес','tg','аз 12 моҳ','en','from 12 months'),'note',jsonb_build_object('ru','официальный трудовой договор','tg','шартномаи расмии меҳнатӣ','en','official employment contract'))
    ),
    'help', jsonb_build_array(
      jsonb_build_object('ru','Консультация о легальном порядке выезда и трудоустройства','tg','Машварат оид ба тартиби қонунии сафар ва корёбӣ','en','Consultation on legal departure and employment procedures'),
      jsonb_build_object('ru','Проверка работодателя и условий трудового договора','tg','Санҷиши корфармо ва шартҳои шартномаи меҳнатӣ','en','Checking the employer and employment contract terms'),
      jsonb_build_object('ru','Направление на языковые курсы и профориентацию','tg','Роҳхат ба курсҳои забон ва касбинтихобкунӣ','en','Referral to language courses and career guidance'),
      jsonb_build_object('ru','Помощь в подготовке документов и подаче на визу','tg','Кӯмак дар омода кардани ҳуҷҷатҳо ва пешниҳоди раводид','en','Help preparing documents and applying for a visa'),
      jsonb_build_object('ru','Выдача Свидетельства о подтверждении профессиональных навыков','tg','Додани Шаҳодатнома оид ба тасдиқи малакаҳои касбӣ','en','Issuing a Certificate confirming professional skills')
    ),
    'professions', jsonb_build_array(
      jsonb_build_object('ru','Уход за пожилыми','tg','Нигоҳубини калонсолон','en','Elderly care'),
      jsonb_build_object('ru','Медсёстры','tg','Ҳамширагон','en','Nurses'),
      jsonb_build_object('ru','Строители','tg','Сохтмончиён','en','Construction workers'),
      jsonb_build_object('ru','Сварщики','tg','Кафшергарон','en','Welders'),
      jsonb_build_object('ru','Электрики','tg','Электрикҳо','en','Electricians'),
      jsonb_build_object('ru','Водители','tg','Ронандагон','en','Drivers'),
      jsonb_build_object('ru','Повара','tg','Ошпазҳо','en','Cooks'),
      jsonb_build_object('ru','Сельское хозяйство','tg','Кишоварзӣ','en','Agriculture'),
      jsonb_build_object('ru','Логистика','tg','Логистика','en','Logistics')
    ),
    'language_note', jsonb_build_object('ru','Для большинства профессий требуется немецкий на уровне A2–B1. Центр направляет на языковые курсы и профориентацию перед выездом.','tg','Барои аксари касбҳо забони олмонӣ дар сатҳи A2–B1 лозим аст. Марказ пеш аз сафар ба курсҳои забон ва касбинтихобкунӣ роҳхат медиҳад.','en','Most professions require German at A2–B1 level. Before departure the Center refers applicants to language courses and career guidance.'),
    'steps', jsonb_build_array(
      jsonb_build_object('n','01','title',jsonb_build_object('ru','Регистрация','tg','Бақайдгирӣ','en','Registration'),'desc',jsonb_build_object('ru','Обратитесь в Центр и подайте заявку','tg','Ба Марказ муроҷиат кунед ва ариза супоред','en','Contact the Center and submit an application')),
      jsonb_build_object('n','02','title',jsonb_build_object('ru','Подготовка','tg','Омодагӣ','en','Preparation'),'desc',jsonb_build_object('ru','Язык, профориентация, подтверждение навыков','tg','Забон, касбинтихобкунӣ, тасдиқи малакаҳо','en','Language, career guidance, skills confirmation')),
      jsonb_build_object('n','03','title',jsonb_build_object('ru','Работодатель','tg','Корфармо','en','Employer'),'desc',jsonb_build_object('ru','Подбор вакансии и приглашение на работу','tg','Интихоби ҷои корӣ ва даъватнома ба кор','en','Job matching and job invitation')),
      jsonb_build_object('n','04','title',jsonb_build_object('ru','Виза','tg','Раводид','en','Visa'),'desc',jsonb_build_object('ru','Подача на рабочую визу или Blue Card','tg','Пешниҳод ба раводиди корӣ ё Blue Card','en','Applying for a work visa or Blue Card')),
      jsonb_build_object('n','05','title',jsonb_build_object('ru','Выезд','tg','Сафар','en','Departure'),'desc',jsonb_build_object('ru','Легальный выезд и сопровождение','tg','Сафари қонунӣ ва ҳамроҳӣ','en','Legal departure and support'))
    ),
    'documents', jsonb_build_array(
      jsonb_build_object('ru','Загранпаспорт (действующий не менее срока контракта)','tg','Шиносномаи хориҷӣ (эътибораш на камтар аз мӯҳлати шартнома)','en','Passport (valid for at least the contract period)'),
      jsonb_build_object('ru','Подтверждение квалификации / диплома (Anerkennung)','tg','Тасдиқи тахассус / диплом (Anerkennung)','en','Qualification/diploma recognition (Anerkennung)'),
      jsonb_build_object('ru','Трудовой договор или приглашение работодателя','tg','Шартномаи меҳнатӣ ё даъватномаи корфармо','en','Employment contract or employer invitation'),
      jsonb_build_object('ru','Сертификат о знании немецкого языка (A2–B1)','tg','Сертификати донистани забони олмонӣ (A2–B1)','en','German language certificate (A2–B1)'),
      jsonb_build_object('ru','Медицинская страховка и справка о состоянии здоровья','tg','Суғуртаи тиббӣ ва маълумотнома оид ба ҳолати саломатӣ','en','Medical insurance and health certificate')
    ),
    'warning_title', jsonb_build_object('ru','Никому не платите за трудоустройство','tg','Барои корёбӣ ба касе пул надиҳед','en','Do not pay anyone for employment'),
    'warning_text', jsonb_build_object('ru','Все услуги Центра бесплатны. Официальная рабочая виза в Германию оформляется только через лицензированного работодателя. Остерегайтесь посредников, которые обещают «гарантированное» место за деньги, и не отдавайте им паспорт или оригиналы документов.','tg','Ҳамаи хидматҳои Марказ ройгонанд. Раводиди расмии корӣ ба Олмон танҳо тавассути корфармои иҷозатнокдор расмӣ мешавад. Аз миёнаравҳое, ки ҷои «кафолатнок»-ро барои пул ваъда медиҳанд, эҳтиёт шавед ва шиноснома ё асли ҳуҷҷатҳоро ба онҳо надиҳед.','en','All Center services are free. An official German work visa is issued only through a licensed employer. Beware of intermediaries promising a guaranteed place for money, and do not give them your passport or original documents.')
  ) WHERE slug='rabota-v-germanii';

COMMIT;
