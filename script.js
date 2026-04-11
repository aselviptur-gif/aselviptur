// =========================================
// 1. MASTER DİL MOTORU (TÜM SAYFALAR BİRLEŞTİRİLDİ)
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
        
        // TURLAR
        "tours-title": "VIP Rotalarımız", "tours-sub": "Türkiye'nin en seçkin destinasyonlarına sınırsız konforla seyahat edin.",
        "t1-title": "Kapadokya Turu", "t1-desc": "Peri bacaları ve balonların dünyasında VIP yolculuk.",
        "t2-title": "Pamukkale Turu", "t2-desc": "Beyaz travertenler ve antik havuzda arınma fırsatı.",
        "book-btn": "Rezerve Et",

        // REZERVASYON FORMU
        "form-title": "VIP Rezervasyon", "f-submit": "Talebi Gönder",
        "f-name": "Adınız Soyadınız", "f-phone": "Telefon Numaranız", 
        "f-from": "Nereden Alınacaksınız?", "f-to": "Nereye Gideceksiniz?",
        "m-opt0": "🎵 Araç İçi Müzik Tercihi", "m-opt1": "Caz & Blues", "m-opt2": "Klasik Müzik", "m-opt3": "Popüler / Güncel", "m-opt4": "Sessiz Sürüş (Silent Ride)", "m-opt5": "Damar Arabesk (VIP Özel)",
        "s-opt0": "🕯️ Araç Kokusu Tercihi", "s-opt1": "Okyanus Ferahlığı", "s-opt2": "Odunsu & Deri (Vip)", "s-opt3": "Vanilya & Çikolata"
    },
    en: { 
        // MAIN PAGE
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
        "q1": "How do I find you at the airport?", "a1": "Your chauffeur will be waiting at the exit gate with a sign with your name on it.", 
        "q2": "What if my flight is delayed?", "a2": "We track your flight instantly and continue to wait without any additional fees.",
        
        // TOURS
        "tours-title": "Our VIP Routes", "tours-sub": "Travel to Turkey's most exclusive destinations with unlimited comfort.",
        "t1-title": "Cappadocia Tour", "t1-desc": "A VIP journey in the world of fairy chimneys and balloons.",
        "t2-title": "Pamukkale Tour", "t2-desc": "A chance to purify in white travertines and ancient pools.",
        "book-btn": "Book Now",

        // RESERVATION FORM
        "form-title": "VIP Booking", "f-submit": "Send Request",
        "f-name": "Full Name", "f-phone": "Phone Number", 
        "f-from": "Pick-up Location", "f-to": "Drop-off Location",
        "m-opt0": "🎵 In-Car Music Preference", "m-opt1": "Jazz & Blues", "m-opt2": "Classical Music", "m-opt3": "Popular / Current", "m-opt4": "Silent Ride", "m-opt5": "Deep Arabesque (VIP Special)",
        "s-opt0": "🕯️ Car Scent Preference", "s-opt1": "Ocean Freshness", "s-opt2": "Woody & Leather (VIP)", "s-opt3": "Vanilla & Chocolate"
    },
    ru: { 
        // ГЛАВНАЯ
        "nav-tours": "СПЕЦИАЛЬНЫЕ ТУРЫ", "back-home": "НА ГЛАВНУЮ",
        "hero-title": "Комфорт Без Границ", "hero-desc": "Самый эксклюзивный трансфер в Анталии", "hero-btn": "БРОНИРОВАНИЕ", "hero-scroll": "Наш автопарк",
        "stat-1": "Довольных Гостей", "stat-2": "Maybach Авто", "stat-3": "Поддержки", 
        "treats-title": "Премиум Привилегии", "treat-water": "Особые Угощения", "treat-water-desc": "Премиальные напитки.",
        "treat-wifi": "Безлимитный Wi-Fi", "treat-wifi-desc": "Всегда на связи.",
        "spec-1": "Бизнес Класс", "spec-1-desc": "Престижное появление.",
        "spec-2": "Безопасность", "spec-2-desc": "VIP стандарты.",
        "driver-title": "Наши Водители", "driver-role": "Старший VIP Водитель",
        "d-exp": "30 Лет Опыта", "d-safe": "VIP Вождение",
        "d-lang1": "Базовый Английский", "d-lang2": "Русский и Английский",
        "fleet-title": "Наш Парк Maybach", "f1-desc": "7+1 VIP | Кожаные Сиденья", "f2-desc": "Премиум Кожа | Apple TV", "fleet-photos": "ГАЛЕРЕЯ", 
        "rev-title": "Отзывы Гостей", "faq-title": "Частые Вопросы", 
        "q1": "Как мне найти вас в аэропорту?", "a1": "Ваш водитель будет ждать вас у выхода с табличкой.", 
        "q2": "Что если мой рейс задержится?", "a2": "Мы отслеживаем рейс и ждем бесплатно.",
        
        // ТУРЫ
        "tours-title": "Наши VIP Маршруты", "tours-sub": "Путешествуйте по эксклюзивным направлениям Турции с комфортом.",
        "t1-title": "Тур в Каппадокию", "t1-desc": "VIP путешествие в мир сказочных дымоходов.",
        "t2-title": "Тур в Памуккале", "t2-desc": "Шанс очиститься в белых травертинах.",
        "book-btn": "Забронировать",

        // БРОНИРОВАНИЕ
        "form-title": "VIP Бронирование", "f-submit": "Отправить Запрос",
        "f-name": "Имя и Фамилия", "f-phone": "Номер Телефона", 
        "f-from": "Место отправления", "f-to": "Место назначения",
        "m-opt0": "🎵 Музыка в авто", "m-opt1": "Джаз и Блюз", "m-opt2": "Классическая музыка", "m-opt3": "Популярная", "m-opt4": "Тихая поездка", "m-opt5": "Арабеск (VIP)",
        "s-opt0": "🕯️ Запах в авто", "s-opt1": "Океанская свежесть", "s-opt2": "Древесный и кожа (VIP)", "s-opt3": "Ваниль и шоколад"
    },
    de: { 
        // STARTSEITE
        "nav-tours": "SPEZIELLE TOUREN", "back-home": "ZURÜCK ZUR STARTSEITE",
        "hero-title": "Grenzenloser Komfort", "hero-desc": "Antalyas exklusivstes Transfer-Erlebnis", "hero-btn": "VIP BUCHUNG", "hero-scroll": "Flotte Ansehen",
        "stat-1": "Zufriedene Gäste", "stat-2": "Maybach Autos", "stat-3": "Support", 
        "treats-title": "Premium Privilegien", "treat-water": "Besondere Leckereien", "treat-water-desc": "Premium-Getränke.",
        "treat-wifi": "Unbegrenztes WLAN", "treat-wifi-desc": "Bleiben Sie verbunden.",
        "spec-1": "Business Class", "spec-1-desc": "Ein prestigeträchtiger Auftritt.",
        "spec-2": "Volle Sicherheit", "spec-2-desc": "VIP-Standards.",
        "driver-title": "Unsere Protokoll-Chauffeure", "driver-role": "Senior VIP Chauffeur",
        "d-exp": "30 Jahre Erfahrung", "d-safe": "VIP Protokoll Fahren",
        "d-lang1": "Grundlegendes Englisch", "d-lang2": "Russisch & Englisch",
        "fleet-title": "Unsere Maybach Flotte", "f1-desc": "7+1 VIP | Ledersitze", "f2-desc": "Premium Leder | Apple TV", "fleet-photos": "GALERIE", 
        "rev-title": "Gästeerfahrungen", "faq-title": "Häufig Gestellte Fragen", 
        "q1": "Wie finde ich Sie am Flughafen?", "a1": "Ihr Chauffeur wartet am Ausgang mit einem Namensschild.", 
        "q2": "Was passiert bei Flugverspätungen?", "a2": "Wir verfolgen Ihren Flug und warten kostenlos.",
        
        // TOUREN
        "tours-title": "Unsere VIP-Routen", "tours-sub": "Reisen Sie mit grenzenlosem Komfort zu den exklusivsten Zielen der Türkei.",
        "t1-title": "Kappadokien-Tour", "t1-desc": "Eine VIP-Reise in die Welt der Feenkamine.",
        "t2-title": "Pamukkale-Tour", "t2-desc": "Entspannen Sie sich in den weißen Travertinen.",
        "book-btn": "Buchen",

        // BUCHUNG
        "form-title": "VIP Buchung", "f-submit": "Anfrage Senden",
        "f-name": "Vor- und Nachname", "f-phone": "Telefonnummer", 
        "f-from": "Abholort", "f-to": "Zielort",
        "m-opt0": "🎵 Musik im Auto", "m-opt1": "Jazz & Blues", "m-opt2": "Klassische Musik", "m-opt3": "Beliebte Musik", "m-opt4": "Stille Fahrt", "m-opt5": "Arabeske (VIP)",
        "s-opt0": "🕯️ Autoduft", "s-opt1": "Ozeanfrische", "s-opt2": "Holzig & Leder (VIP)", "s-opt3": "Vanille & Schokolade"
    }
};

// =========================================
// 2. DİL DEĞİŞTİRİCİ FONKSİYON
// =========================================
function setLanguage(lang, btn) {
    // Normal yazıları çevirir
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Rezervasyon formundaki gri placeholder yazılarını çevirir
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Seçilen dil butonunun rengini altın yapar
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
