export const LANGUAGES=[['en','English'],['pl','Polski'],['de','Deutsch'],['fr','Français'],['es','Español'],['ro','Română'],['ru','Русский'],['it','Italiano'],['pt','Português'],['uk','Українська']] as const;
export type Language=typeof LANGUAGES[number][0];
// Columns: EN | PL | DE | FR | ES | RO | RU | IT | PT | UK
export const rows=`
Language|Język|Sprache|Langue|Idioma|Limbă|Язык|Lingua|Idioma|Мова
Settings|Ustawienia|Einstellungen|Paramètres|Ajustes|Setări|Настройки|Impostazioni|Definições|Налаштування
Station|Stanowisko|Arbeitsplatz|Poste|Puesto|Post de lucru|Рабочее место|Postazione|Posto|Робоче місце
Full screen|Pełny ekran|Vollbild|Plein écran|Pantalla completa|Ecran complet|Полный экран|Schermo intero|Ecrã inteiro|Повний екран
Connected to vMix|Połączono z vMix|Mit vMix verbunden|Connecté à vMix|Conectado a vMix|Conectat la vMix|Подключено к vMix|Connesso a vMix|Ligado ao vMix|Підключено до vMix
DEMO · Connected|DEMO · Połączono|DEMO · Verbunden|DÉMO · Connecté|DEMO · Conectado|DEMO · Conectat|ДЕМО · Подключено|DEMO · Connesso|DEMO · Ligado|ДЕМО · Підключено
Connecting…|Łączenie…|Verbindung wird hergestellt…|Connexion…|Conectando…|Conectare…|Подключение…|Connessione…|A ligar…|Підключення…
Disconnected|Brak połączenia|Nicht verbunden|Déconnecté|Desconectado|Deconectat|Нет подключения|Disconnesso|Desligado|Немає підключення
vMix computer|Komputer z vMix|vMix-Rechner|Ordinateur vMix|Ordenador con vMix|Calculator vMix|Компьютер с vMix|Computer vMix|Computador vMix|Комп’ютер із vMix
Connect|Połącz|Verbinden|Connecter|Conectar|Conectează|Подключить|Connetti|Ligar|Підключити
Start demo|Uruchom demo|Demo starten|Lancer la démo|Iniciar demo|Pornește demo|Запустить демо|Avvia demo|Iniciar demo|Запустити демо
Play after switching|Odtwórz po przełączeniu|Nach Umschalten abspielen|Lire après la transition|Reproducir al cambiar|Redă după comutare|Воспроизвести после переключения|Riproduci dopo il cambio|Reproduzir após mudar|Відтворити після перемикання
Simulation|Symulacja|Simulation|Simulation|Simulación|Simulare|Симуляция|Simulazione|Simulação|Симуляція
Exit demo|Zakończ demo|Demo beenden|Quitter la démo|Salir de la demo|Închide demo|Выйти из демо|Esci dalla demo|Sair da demo|Вийти з демо
Sources|Źródła|Quellen|Sources|Fuentes|Surse|Источники|Sorgenti|Fontes|Джерела
Director|Realizator|Regie|Réalisation|Realizador|Regie|Режиссёр|Regia|Realizador|Режисер
Panel mode|Tryb panelu|Panelmodus|Mode du panneau|Modo del panel|Mod panou|Режим панели|Modalità pannello|Modo do painel|Режим панелі
Main program|Program główny|Hauptprogramm|Programme principal|Programa principal|Program principal|Основная программа|Programma principale|Programa principal|Основна програма
MAIN|GŁÓWNY|HAUPT|PRINCIPAL|PRINCIPAL|PRINCIPAL|ОСНОВНОЙ|PRINCIPALE|PRINCIPAL|ОСНОВНИЙ
ADDITIONAL|DODATKOWY|ZUSÄTZLICH|SUPPLÉMENTAIRE|ADICIONAL|SUPLIMENTAR|ДОПОЛНИТЕЛЬНЫЙ|AGGIUNTIVO|ADICIONAL|ДОДАТКОВИЙ
ON PROGRAM|NA PROGRAMIE|IM PROGRAMM|À L’ANTENNE|EN PROGRAMA|ÎN PROGRAM|В ЭФИРЕ|IN PROGRAMMA|NO PROGRAMA|В ЕФІРІ
LAST READ|OSTATNI ODCZYT|LETZTER STAND|DERNIER ÉTAT|ÚLTIMA LECTURA|ULTIMA CITIRE|ПОСЛЕДНИЕ ДАННЫЕ|ULTIMO STATO|ÚLTIMA LEITURA|ОСТАННІ ДАНІ
No source|Brak źródła|Keine Quelle|Aucune source|Sin fuente|Nicio sursă|Нет источника|Nessuna sorgente|Sem fonte|Немає джерела
Simulated source|Symulowane źródło|Simulierte Quelle|Source simulée|Fuente simulada|Sursă simulată|Симулированный источник|Sorgente simulata|Fonte simulada|Симульоване джерело
Active source|Aktywne źródło|Aktive Quelle|Source active|Fuente activa|Sursă activă|Активный источник|Sorgente attiva|Fonte ativa|Активне джерело
Stale data|Dane nieaktualne|Veraltete Daten|Données obsolètes|Datos desactualizados|Date neactualizate|Данные устарели|Dati non aggiornati|Dados desatualizados|Дані застаріли
On program:|Na programie:|Im Programm:|À l’antenne :|En programa:|În program:|В эфире:|In programma:|No programa:|В ефірі:
Waiting for connection|Oczekuje na połączenie|Warte auf Verbindung|En attente de connexion|Esperando conexión|Se așteaptă conexiunea|Ожидание подключения|In attesa di connessione|A aguardar ligação|Очікування підключення
Unavailable in vMix|Niedostępny w vMix|In vMix nicht verfügbar|Indisponible dans vMix|No disponible en vMix|Indisponibil în vMix|Недоступен в vMix|Non disponibile in vMix|Indisponível no vMix|Недоступний у vMix
Transition|Przejście|Übergang|Transition|Transición|Tranziție|Переход|Transizione|Transição|Перехід
TRANSITION|PRZEJŚCIE|ÜBERGANG|TRANSITION|TRANSICIÓN|TRANZIȚIE|ПЕРЕХОД|TRANSIZIONE|TRANSIÇÃO|ПЕРЕХІД
Duration|Czas|Dauer|Durée|Duración|Durată|Длительность|Durata|Duração|Тривалість
Close|Zamknij|Schließen|Fermer|Cerrar|Închide|Закрыть|Chiudi|Fechar|Закрити
Close message|Zamknij komunikat|Meldung schließen|Fermer le message|Cerrar mensaje|Închide mesajul|Закрыть сообщение|Chiudi messaggio|Fechar mensagem|Закрити повідомлення
Director console|Pulpit realizatora|Regiepult|Console de réalisation|Consola de realización|Consolă de regie|Режиссёрский пульт|Console di regia|Consola de realização|Режисерський пульт
Select source|Wybierz źródło|Quelle wählen|Choisir une source|Elegir fuente|Alege sursa|Выберите источник|Scegli sorgente|Escolher fonte|Виберіть джерело
Source matrix|Matryca źródeł|Quellenmatrix|Matrice des sources|Matriz de fuentes|Matrice de surse|Матрица источников|Matrice sorgenti|Matriz de fontes|Матриця джерел
Refresh|Odśwież|Aktualisieren|Actualiser|Actualizar|Actualizează|Обновить|Aggiorna|Atualizar|Оновити
Search inputs|Szukaj inputów|Eingänge suchen|Rechercher des entrées|Buscar entradas|Caută intrări|Поиск входов|Cerca ingressi|Pesquisar entradas|Пошук входів
Search source…|Szukaj źródła…|Quelle suchen…|Rechercher une source…|Buscar fuente…|Caută sursa…|Поиск источника…|Cerca sorgente…|Pesquisar fonte…|Пошук джерела…
Clear search|Wyczyść wyszukiwanie|Suche löschen|Effacer la recherche|Borrar búsqueda|Șterge căutarea|Очистить поиск|Cancella ricerca|Limpar pesquisa|Очистити пошук
Favorites|Ulubione|Favoriten|Favoris|Favoritos|Favorite|Избранное|Preferiti|Favoritos|Обране
Filter group|Filtruj grupę|Gruppe filtern|Filtrer le groupe|Filtrar grupo|Filtrează grupul|Фильтр группы|Filtra gruppo|Filtrar grupo|Фільтр групи
All groups|Wszystkie grupy|Alle Gruppen|Tous les groupes|Todos los grupos|Toate grupurile|Все группы|Tutti i gruppi|Todos os grupos|Усі групи
Clear|Wyczyść|Löschen|Effacer|Limpiar|Șterge|Очистить|Cancella|Limpar|Очистити
Connection:|Połączenie:|Verbindung:|Connexion :|Conexión:|Conexiune:|Подключение:|Connessione:|Ligação:|Підключення:
No visible inputs|Brak widocznych inputów|Keine sichtbaren Eingänge|Aucune entrée visible|Sin entradas visibles|Nicio intrare vizibilă|Нет видимых входов|Nessun ingresso visibile|Sem entradas visíveis|Немає видимих входів
Open station|Otwórz stanowisko|Arbeitsplatz öffnen|Ouvrir le poste|Abrir puesto|Deschide postul|Открыть рабочее место|Apri postazione|Abrir posto|Відкрити робоче місце
No results|Brak wyników|Keine Ergebnisse|Aucun résultat|Sin resultados|Niciun rezultat|Нет результатов|Nessun risultato|Sem resultados|Немає результатів
Clear filters|Wyczyść filtry|Filter löschen|Effacer les filtres|Borrar filtros|Șterge filtrele|Сбросить фильтры|Cancella filtri|Limpar filtros|Скинути фільтри
Playing|Odtwarzanie|Wiedergabe|Lecture|Reproduciendo|Redare|Воспроизведение|Riproduzione|A reproduzir|Відтворення
Paused|Wstrzymany|Pausiert|En pause|Pausado|În pauză|Пауза|In pausa|Em pausa|Пауза
Confirming…|Potwierdzanie…|Bestätigung läuft…|Confirmation…|Confirmando…|Confirmare…|Подтверждение…|Conferma…|A confirmar…|Підтвердження…
This mix|Ten mix|Dieser Mix|Ce mix|Este mix|Acest mix|Этот микс|Questo mix|Este mix|Цей мікс
On program|Na programie|Im Programm|À l’antenne|En programa|În program|В эфире|In programma|No programa|В ефірі
Send to program|Wyślij na program|Ins Programm senden|Envoyer à l’antenne|Enviar al programa|Trimite în program|Отправить в эфир|Invia al programma|Enviar para programa|Надіслати в ефір
SOURCE|ŹRÓDŁO|QUELLE|SOURCE|FUENTE|SURSĂ|ИСТОЧНИК|SORGENTE|FONTE|ДЖЕРЕЛО
Available inputs|Dostępne inputy|Verfügbare Eingänge|Entrées disponibles|Entradas disponibles|Intrări disponibile|Доступные входы|Ingressi disponibili|Entradas disponíveis|Доступні входи
Switch|Przełącz|Umschalten|Commuter|Cambiar|Comută|Переключить|Commuta|Mudar|Перемкнути
No inputs|Brak inputów|Keine Eingänge|Aucune entrée|Sin entradas|Nicio intrare|Нет входов|Nessun ingresso|Sem entradas|Немає входів
Connect to vMix|Połącz się ze swoim vMix|Mit vMix verbinden|Connectez-vous à vMix|Conéctate a vMix|Conectează-te la vMix|Подключитесь к vMix|Connettiti a vMix|Ligue-se ao vMix|Підключіться до vMix
Direct CUT|Bezpośredni CUT|Direkter CUT|CUT direct|CUT directo|CUT direct|Прямой CUT|CUT diretto|CUT direto|Прямий CUT
Select preview|Wybór podglądu|Vorschau wählen|Choisir l’aperçu|Elegir vista previa|Alege previzualizarea|Выбор предпросмотра|Scegli anteprima|Escolher pré-visualização|Вибір попереднього перегляду
Take to program|Przejście na program|Ins Programm übernehmen|Passer à l’antenne|Pasar al programa|Treci în program|Переход в эфир|Passa al programma|Passar para programa|Перехід в ефір
AUTO effect|Efekt AUTO|AUTO-Effekt|Effet AUTO|Efecto AUTO|Efect AUTO|Эффект AUTO|Effetto AUTO|Efeito AUTO|Ефект AUTO
No preview|Brak podglądu|Keine Vorschau|Aucun aperçu|Sin vista previa|Fără previzualizare|Нет предпросмотра|Nessuna anteprima|Sem pré-visualização|Немає попереднього перегляду
Ready|Gotowy|Bereit|Prêt|Listo|Pregătit|Готово|Pronto|Pronto|Готово
Load saved station|Wczytaj zapisane stanowisko|Arbeitsplatz laden|Charger le poste|Cargar puesto guardado|Încarcă postul salvat|Загрузить рабочее место|Carica postazione|Carregar posto guardado|Завантажити робоче місце
Load profile…|Wczytaj profil…|Profil laden…|Charger un profil…|Cargar perfil…|Încarcă profil…|Загрузить профиль…|Carica profilo…|Carregar perfil…|Завантажити профіль…
Save profile|Zapisz profil|Profil speichern|Enregistrer le profil|Guardar perfil|Salvează profilul|Сохранить профиль|Salva profilo|Guardar perfil|Зберегти профіль
Station link|Link stanowiska|Arbeitsplatz-Link|Lien du poste|Enlace del puesto|Link post|Ссылка рабочего места|Link postazione|Ligação do posto|Посилання робочого місця
Profiles|Profile|Profile|Profils|Perfiles|Profiluri|Профили|Profili|Perfis|Профілі
Input layout|Układ inputów|Eingangslayout|Disposition des entrées|Diseño de entradas|Aranjare intrări|Расположение входов|Disposizione ingressi|Disposição das entradas|Розташування входів
Tile size|Rozmiar kafelków|Kachelgröße|Taille des vignettes|Tamaño de botones|Dimensiune dale|Размер плиток|Dimensione riquadri|Tamanho dos blocos|Розмір плиток
Small tiles|Małe kafelki|Kleine Kacheln|Petites vignettes|Botones pequeños|Dale mici|Маленькие плитки|Riquadri piccoli|Blocos pequenos|Малі плитки
Medium tiles|Średnie kafelki|Mittlere Kacheln|Vignettes moyennes|Botones medianos|Dale medii|Средние плитки|Riquadri medi|Blocos médios|Середні плитки
Large tiles|Duże kafelki|Große Kacheln|Grandes vignettes|Botones grandes|Dale mari|Большие плитки|Riquadri grandi|Blocos grandes|Великі плитки
Show newly added inputs|Pokazuj nowo dodane inputy|Neue Eingänge anzeigen|Afficher les nouvelles entrées|Mostrar nuevas entradas|Arată intrările noi|Показывать новые входы|Mostra nuovi ingressi|Mostrar novas entradas|Показувати нові входи
Input currently unavailable|Input obecnie niedostępny|Eingang derzeit nicht verfügbar|Entrée actuellement indisponible|Entrada no disponible|Intrare indisponibilă momentan|Вход сейчас недоступен|Ingresso non disponibile|Entrada indisponível|Вхід зараз недоступний
unavailable input|niedostępny input|nicht verfügbarer Eingang|entrée indisponible|entrada no disponible|intrare indisponibilă|недоступный вход|ingresso non disponibile|entrada indisponível|недоступний вхід
Saved profiles|Zapisane profile|Gespeicherte Profile|Profils enregistrés|Perfiles guardados|Profiluri salvate|Сохранённые профили|Profili salvati|Perfis guardados|Збережені профілі
Import|Importuj|Importieren|Importer|Importar|Importă|Импорт|Importa|Importar|Імпорт
Export|Eksportuj|Exportieren|Exporter|Exportar|Exportă|Экспорт|Esporta|Exportar|Експорт
No saved profiles|Brak zapisanych profili|Keine gespeicherten Profile|Aucun profil enregistré|Sin perfiles guardados|Niciun profil salvat|Нет сохранённых профилей|Nessun profilo salvato|Sem perfis guardados|Немає збережених профілів
New profile name|Nowa nazwa profilu|Neuer Profilname|Nouveau nom du profil|Nuevo nombre del perfil|Nume nou de profil|Новое имя профиля|Nuovo nome profilo|Novo nome do perfil|Нова назва профілю
Save name|Zapisz nazwę|Namen speichern|Enregistrer le nom|Guardar nombre|Salvează numele|Сохранить имя|Salva nome|Guardar nome|Зберегти назву
Cancel rename|Anuluj zmianę nazwy|Umbenennen abbrechen|Annuler le renommage|Cancelar cambio de nombre|Anulează redenumirea|Отменить переименование|Annulla rinomina|Cancelar mudança de nome|Скасувати перейменування
Rename|Zmień nazwę|Umbenennen|Renommer|Renombrar|Redenumește|Переименовать|Rinomina|Mudar nome|Перейменувати
Duplicate|Duplikuj|Duplizieren|Dupliquer|Duplicar|Duplică|Дублировать|Duplica|Duplicar|Дублювати
Delete|Usuń|Löschen|Supprimer|Eliminar|Șterge|Удалить|Elimina|Eliminar|Видалити
Undo|Cofnij|Rückgängig|Annuler|Deshacer|Anulează|Отменить|Annulla|Anular|Скасувати
All mixes|Wszystkie mixy|Alle Mixe|Tous les mix|Todos los mixes|Toate mixurile|Все миксы|Tutti i mix|Todos os mixes|Усі мікси
Mix unavailable|Mix niedostępny|Mix nicht verfügbar|Mix indisponible|Mix no disponible|Mix indisponibil|Микс недоступен|Mix non disponibile|Mix indisponível|Мікс недоступний
Saved mix|Zapamiętany mix|Gespeicherter Mix|Mix mémorisé|Mix guardado|Mix memorat|Сохранённый микс|Mix salvato|Mix guardado|Збережений мікс
Choose another|Wybierz inny|Anderen wählen|Choisir un autre|Elegir otro|Alege altul|Выбрать другой|Scegli altro|Escolher outro|Вибрати інший
Connect to vMix|Połącz z vMix|Mit vMix verbinden|Se connecter à vMix|Conectar a vMix|Conectare la vMix|Подключить vMix|Connetti a vMix|Ligar ao vMix|Підключити vMix
SELECT MIX|WYBIERZ MIX|MIX WÄHLEN|CHOISIR LE MIX|ELEGIR MIX|ALEGE MIXUL|ВЫБЕРИТЕ МИКС|SCEGLI MIX|ESCOLHER MIX|ВИБЕРІТЬ МІКС
Mix selection|Wybór mixa|Mix-Auswahl|Sélection du mix|Selección de mix|Selectare mix|Выбор микса|Selezione mix|Seleção de mix|Вибір міксу
Search name or number…|Szukaj nazwy lub numeru…|Name oder Nummer suchen…|Rechercher nom ou numéro…|Buscar nombre o número…|Caută nume sau număr…|Поиск по имени или номеру…|Cerca nome o numero…|Pesquisar nome ou número…|Пошук за назвою чи номером…
Search mix|Szukaj mixa|Mix suchen|Rechercher un mix|Buscar mix|Caută mix|Поиск микса|Cerca mix|Pesquisar mix|Пошук міксу
No mix found|Nie znaleziono mixa|Kein Mix gefunden|Aucun mix trouvé|Mix no encontrado|Niciun mix găsit|Микс не найден|Nessun mix trovato|Nenhum mix encontrado|Мікс не знайдено
Available mixes|Dostępne mixy|Verfügbare Mixe|Mix disponibles|Mixes disponibles|Mixuri disponibile|Доступные миксы|Mix disponibili|Mixes disponíveis|Доступні мікси
Other|Pozostałe|Weitere|Autres|Otros|Altele|Прочее|Altri|Outros|Інше
inputs|inputów|Eingänge|entrées|entradas|intrări|входов|ingressi|entradas|входів
`;
