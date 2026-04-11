// =========================================
// 1. MASTER DİL MOTORU (TÜM SAYFALAR & 16 TUR BİRLEŞTİRİLDİ)
// =========================================
const translations = {
    tr: { 
        // ANA SAYFA
        "nav-tours": "ÖZEL TURLAR", "back-home": "ANA SAYFA",
        "hero-title": "Sınır Tanımayan Konfor", "hero-desc": "Antalya'nın En Seçkin Transfer Deneyimi", "hero-btn": "VIP REZERVASYON", "hero-scroll": "Filoyu İncele",
        "stat-1": "Mutlu Misafir", "stat-2": "Maybach Araç", "stat-3": "Saat Destek", 
        "treats-title": "Premium Ayrıcalıklar", "treat-water": "Özel İkramlar", "treat-water-desc": "Premium içecekler.",
        "treat-wifi": "Sınırsız Wi-Fi", "treat-wifi-desc": "Asla kopmayın.",
        "spec-1": "Business Class", "spec-1-desc": "Prestijli giriş yapın.",
        "spec-2": "Tam Güvenlik", "spec-2-desc": "VIP standartlar.",
        "driver-title": "Protokol Şoförlerimiz", "driver-role": "Kıdemli VIP Şoför",
        "d-exp": "30 Yıllık Sürüş Tecrübesi", "d-safe": "VIP Protokol Sürüşü",
        "d-lang1": "Temel Düzey İngilizce", "d-lang2": "Rusça & İngilizce",
        "fleet-title": "Maybach Filomuz", "f1-desc": "7+1 VIP | Deri Koltuk | İklimlendirme", "f2-desc": "Premium Deri | Çift Minibar | Apple TV", "fleet-photos": "GALERİ", 
        "rev-title": "Misafir Deneyimleri", "faq-title": "Sıkça Sorulan Sorular", 
        "q1": "Havalimanında sizi nasıl bulurum?", "a1": "Şoförünüz çıkış kapısında isminizin yazılı olduğu tabela ile sizi bekliyor olacak.", 
        "q2": "Uçağım rötar yaparsa ne olur?", "a2": "Uçuşunuzu anlık takip ediyoruz, ek ücret almadan beklemeye devam ederiz.",
        
        // 16 VIP TUR
        "tours-title": "VIP Rotalarımız", "tours-sub": "Türkiye'nin en seçkin destinasyonlarına sınırsız konforla seyahat edin.",
        "t1-title": "Kapadokya Turu", "t1-desc": "Peri bacaları ve sıcak hava balonlarının büyüleyici dünyasında masalsı bir VIP yolculuk.",
        "t2-title": "Pamukkale Turu", "t2-desc": "Bembeyaz travertenler ve Kleopatra Antik Havuzu'nda şifa ve tarihi bir arada yaşayın.",
        "t3-title": "Efes Antik Kenti", "t3-desc": "Roma İmparatorluğu'nun en görkemli kalıntıları arasında tarihi bir VIP yürüyüş.",
        "t4-title": "Demre & Kekova", "t4-desc": "Noel Baba'nın kilisesi ve sular altındaki antik Batık Şehir Kekova'da tekne turu imkanı.",
        "t5-title": "Olympos & Yanartaş", "t5-desc": "Mitolojik sönmeyen ateş Yanartaş ve antik Olympos kalıntıları arasında mistik bir akşam.",
        "t6-title": "Salda Gölü", "t6-desc": "Türkiye'nin Maldivleri olarak bilinen Salda'nın beyaz kumları ve turkuaz sularında huzur.",
        "t7-title": "Fethiye & Ölüdeniz", "t7-desc": "Dünyaca ünlü Ölüdeniz lagünü, Babadağ manzarası ve Saklıkent kanyonu keşfi.",
        "t8-title": "Kaş & Kalkan", "t8-desc": "Lüks villaları, bozulmamış koyları ve Kaputaş Plajı ile Akdeniz'in en elit kaçamağı.",
        "t9-title": "Göbeklitepe, Urfa", "t9-desc": "İnsanlık tarihinin sıfır noktasına, medeniyetin doğduğu efsanevi tapınaklara yolculuk.",
        "t10-title": "Nemrut Dağı", "t10-desc": "Kommagene Krallığı'nın devasa tanrı heykelleri eşliğinde zirvede unutulmaz bir gündoğumu.",
        "t11-title": "Şirince & Alaçatı", "t11-desc": "Ege'nin taş evleri, şarap tadım bağları ve rüzgar sörfü merkezlerinde elit bir haftasonu.",
        "t12-title": "Karadeniz Yaylaları", "t12-desc": "Ayder, Uzungöl ve Fırtına Deresi'nin yemyeşil doğasında Maybach konforuyla VIP safari.",
        "t13-title": "İstanbul Boğazı", "t13-desc": "Tarihi yarımada, görkemli saraylar ve Asya ile Avrupa'yı birleştiren boğazda lüks deneyim.",
        "t14-title": "Uludağ, Bursa", "t14-desc": "Kış turizminin zirvesi Uludağ'da karın ve lüks kayak otellerinin tadını çıkarın.",
        "t15-title": "Truva & Gelibolu", "t15-desc": "Efsanevi Truva atı ve Çanakkale'nin tarihi dokusu içinde geçmişe saygı yolculuğu.",
        "t16-title": "Mardin Eski Şehir", "t16-desc": "Mezopotamya ovasına nazır taş evler, Darülzafaran ve Midyat'ın mistik atmosferi.",
        "book-btn": "Rezerve Et",

        // REZERVASYON FORMU
        "form-title": "VIP Rezervasyon", "f-submit": "Talebi Gönder",
        "f-name": "Adınız Soyadınız", "f-phone": "Telefon Numaranız", 
        "f-from": "Nereden Alınacaksınız?", "f-to": "Nereye Gideceksiniz?",
        "m-opt0": "🎵 Araç İçi Müzik Tercihi", "m-opt1": "Caz & Blues", "m-opt2": "Klasik Müzik", "m-opt3": "Popüler / Güncel", "m-opt4": "Sessiz Sürüş (Silent Ride)", "m-opt5": "Damar Arabesk (VIP Özel)",
        "s-opt0": "🕯️ Araç Kokusu Tercihi", "s-opt1": "Okyanus Ferahlığı", "s-opt2": "Odunsu & Deri (Vip)", "s-opt3": "Vanilya & Çikolata"
    },
    en: { 
        "nav-tours": "SPECIAL TOURS", "back-home": "BACK TO HOME",
        "hero-title": "Boundless Comfort", "hero-desc": "Antalya's Most Exclusive Transfer Experience", "hero-btn": "VIP BOOKING", "hero-scroll": "Explore Fleet",
        "stat-1": "Happy Guests", "stat-2": "Maybach Cars", "stat-3": "Support", 
        "treats-title": "Premium Privileges", "treat-water": "Special Treats", "treat-water-desc": "Premium beverages.",
        "treat-wifi": "Unlimited Wi-Fi", "treat-wifi-desc": "Never disconnect.",
        "spec-1": "Business Class", "spec-1-desc": "Make a prestigious entrance.",
        "spec-2": "Full Security", "spec-2-desc": "VIP standards.",
        "driver-title": "Our Protocol Chauffeurs", "driver-role": "Senior VIP Chauffeur",
        "d-exp": "30 Years of Experience", "d-safe": "VIP Protocol Driving",
        "d-lang1": "Basic English", "d-lang2": "Russian & English",
        "fleet-title": "Our Maybach Fleet", "f1-desc": "7+1 VIP | Leather Seats | AC", "f2-desc": "Premium Leather | Dual Minibar | Apple TV", "fleet-photos": "GALLERY", 
        "rev-title": "Guest Experiences", "faq-title": "FAQ", 
        "q1": "How do I find you at the airport?", "a1": "Your chauffeur will wait at the exit with a sign.", 
        "q2": "What if my flight is delayed?", "a2": "We track your flight and wait with no extra fees.",
        
        "tours-title": "Our VIP Routes", "tours-sub": "Travel to Turkey's most exclusive destinations with unlimited comfort.",
        "t1-title": "Cappadocia Tour", "t1-desc": "A fairy-tale VIP journey in the world of fairy chimneys and balloons.",
        "t2-title": "Pamukkale Tour", "t2-desc": "Healing and history together in the white travertines and ancient pool.",
        "t3-title": "Ancient City of Ephesus", "t3-desc": "A historical VIP walk among the glorious ruins of the Roman Empire.",
        "t4-title": "Demre & Kekova", "t4-desc": "Church of St. Nicholas and a boat tour in the sunken ancient city.",
        "t5-title": "Olympos & Chimaera", "t5-desc": "A mystical evening with eternal flames and ancient Olympos ruins.",
        "t6-title": "Salda Lake", "t6-desc": "Peace in the white sands and turquoise waters of the Turkish Maldives.",
        "t7-title": "Fethiye & Oludeniz", "t7-desc": "Discover the blue lagoon, Mount Babadag, and Saklikent canyon.",
        "t8-title": "Kas & Kalkan", "t8-desc": "The elite Mediterranean getaway with luxury villas and untouched bays.",
        "t9-title": "Gobeklitepe, Urfa", "t9-desc": "Journey to the zero point of human history and ancient temples.",
        "t10-title": "Mount Nemrut", "t10-desc": "Unforgettable sunrise alongside the colossal statues of ancient gods.",
        "t11-title": "Sirince & Alacati", "t11-desc": "Elite weekend with Aegean stone houses, wine tasting, and windsurfing.",
        "t12-title": "Black Sea Plateaus", "t12-desc": "VIP safari in the lush green nature of Ayder and Uzungol.",
        "t13-title": "Bosphorus, Istanbul", "t13-desc": "Luxury experience uniting Asia and Europe with glorious palaces.",
        "t14-title": "Uludag, Bursa", "t14-desc": "Enjoy the snow and luxury ski resorts at the peak of winter tourism.",
        "t15-title": "Troy & Gallipoli", "t15-desc": "A journey of respect into the historical texture of the Trojan Horse.",
        "t16-title": "Mardin Old Town", "t16-desc": "Mystical atmosphere of stone houses overlooking the Mesopotamian plain.",
        "book-btn": "Book Now",

        "form-title": "VIP Booking", "f-submit": "Send Request",
        "f-name": "Full Name", "f-phone": "Phone Number", "f-from": "Pick-up Location", "f-to": "Drop-off Location",
        "m-opt0": "🎵 In-Car Music Preference", "m-opt1": "Jazz & Blues", "m-opt2": "Classical", "m-opt3": "Popular", "m-opt4": "Silent Ride", "m-opt5": "Deep Arabesque",
        "s-opt0": "🕯️ Car Scent Preference", "s-opt1": "Ocean Fresh", "s-opt2": "Woody & Leather", "s-opt3": "Vanilla & Chocolate"
    },
    ru: { 
        "nav-tours": "ТУРЫ", "back-home": "НА ГЛАВНУЮ",
        "hero-title": "Комфорт Без Границ", "hero-desc": "Эксклюзивный трансфер в Анталии", "hero-btn": "БРОНИРОВАНИЕ", "hero-scroll": "Наш автопарк",
        "stat-1": "Довольных Гостей", "stat-2": "Maybach Авто", "stat-3": "Поддержки", 
        "treats-title": "Премиум Привилегии", "treat-water": "Особые Угощения", "treat-water-desc": "Премиальные напитки.",
        "treat-wifi": "Безлимитный Wi-Fi", "treat-wifi-desc": "Всегда на связи.",
        "spec-1": "Бизнес Класс", "spec-1-desc": "Престижное появление.",
        "spec-2": "Безопасность", "spec-2-desc": "VIP стандарты.",
        "driver-title": "Наши Водители", "driver-role": "VIP Водитель",
        "d-exp": "30 Лет Опыта", "d-safe": "VIP Вождение",
        "d-lang1": "Базовый Английский", "d-lang2": "Русский и Английский",
        "fleet-title": "Наш Парк Maybach", "f1-desc": "7+1 VIP | Кожа", "f2-desc": "Премиум Кожа | Apple TV", "fleet-photos": "ГАЛЕРЕЯ", 
        "rev-title": "Отзывы Гостей", "faq-title": "Частые Вопросы", 
        "q1": "Как найти вас в аэропорту?", "a1": "Водитель ждет с табличкой.", 
        "q2": "Что если рейс задержится?", "a2": "Мы ждем бесплатно.",
        
        "tours-title": "Наши VIP Маршруты", "tours-sub": "Путешествуйте по лучшим местам Турции с комфортом.",
        "t1-title": "Тур в Каппадокию", "t1-desc": "Сказочное VIP путешествие в мир шаров и дымоходов.",
        "t2-title": "Тур в Памуккале", "t2-desc": "Белые травертины и античный бассейн Клеопатры.",
        "t3-title": "Эфес", "t3-desc": "VIP прогулка по руинам Римской Империи.",
        "t4-title": "Демре и Кекова", "t4-desc": "Церковь Святого Николая и затонувший город.",
        "t5-title": "Олимпос и Химера", "t5-desc": "Мистический вечер с вечными огнями и руинами.",
        "t6-title": "Озеро Салда", "t6-desc": "Белые пески и бирюзовые воды Турецких Мальдив.",
        "t7-title": "Фетхие и Олюдениз", "t7-desc": "Голубая лагуна, гора Бабадаг и каньон Саклыкент.",
        "t8-title": "Каш и Калкан", "t8-desc": "Элитный отдых с роскошными виллами и пляжами.",
        "t9-title": "Гёбекли-Тепе", "t9-desc": "Путешествие к нулевой точке истории человечества.",
        "t10-title": "Гора Немрут", "t10-desc": "Незабываемый рассвет со статуями древних богов.",
        "t11-title": "Шириндже и Алачати", "t11-desc": "Каменные дома, вино и виндсерфинг на Эгейском море.",
        "t12-title": "Плато Черного моря", "t12-desc": "VIP сафари на природе Айдера и Узунгеля.",
        "t13-title": "Босфор, Стамбул", "t13-desc": "Роскошный опыт между Азией и Европой.",
        "t14-title": "Улудаг, Бурса", "t14-desc": "Наслаждайтесь снегом на роскошных горнолыжных курортах.",
        "t15-title": "Троя и Галлиполи", "t15-desc": "Путешествие в историческую текстуру Троянского коня.",
        "t16-title": "Старый Мардин", "t16-desc": "Мистическая атмосфера каменных домов Месопотамии.",
        "book-btn": "Забронировать",

        "form-title": "VIP Бронирование", "f-submit": "Отправить Запрос",
        "f-name": "Имя и Фамилия", "f-phone": "Номер Телефона", "f-from": "Откуда", "f-to": "Куда",
        "m-opt0": "🎵 Музыка", "m-opt1": "Джаз", "m-opt2": "Классика", "m-opt3": "Поп", "m-opt4": "Тишина", "m-opt5": "Арабеск",
        "s-opt0": "🕯️ Запах", "s-opt1": "Океан", "s-opt2": "Кожа и Дерево", "s-opt3": "Ваниль"
    },
    de: { 
        "nav-tours": "SPEZIELLE TOUREN", "back-home": "STARTSEITE",
        "hero-title": "Grenzenloser Komfort", "hero-desc": "Antalyas exklusivstes Transfer-Erlebnis", "hero-btn": "VIP BUCHUNG", "hero-scroll": "Flotte Ansehen",
        "stat-1": "Zufriedene Gäste", "stat-2": "Maybach Autos", "stat-3": "Support", 
        "treats-title": "Premium Privilegien", "treat-water": "Besondere Leckereien", "treat-water-desc": "Premium-Getränke.",
        "treat-wifi": "Unbegrenztes WLAN", "treat-wifi-desc": "Bleiben Sie verbunden.",
        "spec-1": "Business Class", "spec-1-desc": "Prestigeträchtiger Auftritt.",
        "spec-2": "Volle Sicherheit", "spec-2-desc": "VIP-Standards.",
        "driver-title": "Unsere Chauffeure", "driver-role": "Senior VIP Chauffeur",
        "d-exp": "30 Jahre Erfahrung", "d-safe": "VIP Protokoll Fahren",
        "d-lang1": "Englisch", "d-lang2": "Russisch & Englisch",
        "fleet-title": "Unsere Maybach Flotte", "f1-desc": "7+1 VIP | Ledersitze", "f2-desc": "Premium Leder | Apple TV", "fleet-photos": "GALERIE", 
        "rev-title": "Gästeerfahrungen", "faq-title": "FAQ", 
        "q1": "Wie finde ich Sie am Flughafen?", "a1": "Chauffeur wartet mit Namensschild.", 
        "q2": "Bei Flugverspätungen?", "a2": "Wir warten kostenlos.",
        
        "tours-title": "Unsere VIP-Routen", "tours-sub": "Reisen Sie zu den exklusivsten Zielen der Türkei.",
        "t1-title": "Kappadokien-Tour", "t1-desc": "Eine Reise in die Welt der Feenkamine und Ballons.",
        "t2-title": "Pamukkale-Tour", "t2-desc": "Weiße Travertine und der antike Kleopatra-Pool.",
        "t3-title": "Antikes Ephesus", "t3-desc": "Historischer VIP-Spaziergang durch römische Ruinen.",
        "t4-title": "Demre & Kekova", "t4-desc": "St. Nikolaus Kirche und Bootstour zur versunkenen Stadt.",
        "t5-title": "Olympos & Chimaera", "t5-desc": "Ein mystischer Abend mit ewigen Flammen.",
        "t6-title": "Salda-See", "t6-desc": "Die türkischen Malediven mit weißem Sand.",
        "t7-title": "Fethiye & Ölüdeniz", "t7-desc": "Blaue Lagune, Berg Babadag und Saklikent Schlucht.",
        "t8-title": "Kas & Kalkan", "t8-desc": "Luxusvillen und unberührte Buchten am Mittelmeer.",
        "t9-title": "Göbeklitepe, Urfa", "t9-desc": "Reise zum Nullpunkt der Menschheitsgeschichte.",
        "t10-title": "Berg Nemrut", "t10-desc": "Unvergesslicher Sonnenaufgang mit Götterstatuen.",
        "t11-title": "Sirince & Alacati", "t11-desc": "Ägäische Steinhäuser und Weinproben.",
        "t12-title": "Schwarzmeer Hochebenen", "t12-desc": "VIP-Safari in der Natur von Ayder und Uzungöl.",
        "t13-title": "Bosporus, Istanbul", "t13-desc": "Luxuserlebnis zwischen Asien und Europa.",
        "t14-title": "Uludag, Bursa", "t14-desc": "Genießen Sie den Schnee in Luxus-Skigebieten.",
        "t15-title": "Troja & Gallipoli", "t15-desc": "Eine historische Reise zum Trojanischen Pferd.",
        "t16-title": "Mardin Altstadt", "t16-desc": "Mystische Steinhäuser mit Blick auf Mesopotamien.",
        "book-btn": "Buchen",

        "form-title": "VIP Buchung", "f-submit": "Anfrage Senden",
        "f-name": "Name", "f-phone": "Telefon", "f-from": "Abholort", "f-to": "Zielort",
        "m-opt0": "🎵 Musik", "m-opt1": "Jazz", "m-opt2": "Klassik", "m-opt3": "Pop", "m-opt4": "Stille", "m-opt5": "Arabeske",
        "s-opt0": "🕯️ Duft", "s-opt1": "Ozean", "s-opt2": "Holz & Leder", "s-opt3": "Vanille"
    }
};

// =========================================
// 2. DİL DEĞİŞTİRİCİ FONKSİYON
// =========================================
function setLanguage(lang, btn) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
    });
    if(btn) {
        btn.classList.add('active');
    }
}

// =========================================
// 3. İSTATİSTİK SAYAÇ ANİMASYONU
// =========================================
const counters = document.querySelectorAll('.stat-num');
const speed = 100;

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 25);
        } else {
            counter.innerText = target + (target > 100 ? "+" : ""); 
        }
    };
    updateCount();
});

// =========================================
// 4. SİBER GÜVENLİK (KOD ÇALMA ENGELİ)
// =========================================
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) { 
    if(e.keyCode == 123) return false; 
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; 
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false; 
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; 
};
