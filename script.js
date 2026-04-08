// --- 1. DİL MOTORU (TRANSLATIONS) ---
const translations = {
    tr: { 
        "hero-title": "Sınır Tanımayan Konfor", "hero-desc": "Antalya'nın lüks transfer adresi.", "hero-btn": "REZERVASYON YAP", 
        "stat-1": "Mutlu Misafir", "stat-2": "Lüks Araç", "stat-3": "Saat Destek", 
        "treats-title": "Premium İkramlar & Hizmetler", "treat-water": "İçecek & Su", "treat-wifi": "Yüksek Hızda Wi-Fi", 
        "spec-1": "Business Transfer", "spec-3": "Gece Turları", "dest-title": "VIP Destinasyonlar", 
        "fleet-title": "Lüks Araç Filomuz", "driver-title": "Uzman Şoförlerimiz", "driver-touch": "KARTVİZİT İÇİN DOKUNUN", 
        "fleet-photos": "FOTOĞRAFLAR", "fleet-video": "VİDEO İZLE", "f1-desc": "7+1 VIP Kapasite | Deri Koltuk | Minibar", "f2-desc": "7+1 Ultra Lüks Konfor | Deri Koltuk | Minibar",
        "rev-title": "Misafir Deneyimleri", "faq-title": "Sıkça Sorulan Sorular", "q1": "Havalimanında sizi nasıl bulurum?", "a1": "Şoförünüz çıkış kapısında isminizin yazılı olduğu tabela ile sizi bekliyor olacak.", "q2": "Uçağım rötar yaparsa ne olur?", "a2": "Uçuşunuzu anlık takip ediyoruz, ek ücret almadan beklemeye devam ederiz.", 
        "form-title": "VIP Rezervasyon", "form-send": "BİLGİLERİ GÖNDER", "p-name": "ADINIZ SOYADINIZ", "p-mail": "E-POSTA", "p-date": "📅 TARİH VE SAAT SEÇİN", "p-msg": "ÖZEL İSTEKLERİNİZ..." 
    },
    en: { 
        "hero-title": "Unlimited Comfort", "hero-desc": "Antalya's luxury transfer.", "hero-btn": "BOOK NOW", 
        "stat-1": "Happy Guests", "stat-2": "Luxury Cars", "stat-3": "24/7 Support", 
        "treats-title": "Premium Treats & Services", "treat-water": "Water & Drinks", "treat-wifi": "Fast Wi-Fi", 
        "spec-1": "Business Transfer", "spec-3": "Night Tours", "dest-title": "VIP Destinations", 
        "fleet-title": "Our Luxury Fleet", "driver-title": "Our Chauffeurs", "driver-touch": "TAP FOR CARD", 
        "fleet-photos": "PHOTOS", "fleet-video": "VIDEO", "f1-desc": "7+1 Capacity | Leather Seats | Minibar", "f2-desc": "7+1 Ultra Luxury | Leather Seats | Minibar",
        "rev-title": "Guest Experiences", "faq-title": "FAQ", "q1": "How to find you?", "a1": "We wait with a sign at the exit.", "q2": "Flight delayed?", "a2": "We track it and wait for free.", 
        "form-title": "VIP Booking", "form-send": "SEND DETAILS", "p-name": "FULL NAME", "p-mail": "EMAIL", "p-date": "📅 SELECT DATE & TIME", "p-msg": "SPECIAL REQUESTS..." 
    },
    ru: { 
        "hero-title": "Комфорт Без Границ", "hero-desc": "Адрес роскошного трансфера в Анталии.", "hero-btn": "ЗАБРОНИРОВАТЬ", 
        "stat-1": "Довольных Гостей", "stat-2": "Роскошных Авто", "stat-3": "Часов Поддержки", 
        "treats-title": "Премиум Угощения", "treat-water": "Напитки и Вода", "treat-wifi": "Быстрый Wi-Fi", 
        "spec-1": "Бизнес Трансфер", "spec-3": "Ночные Туры", "dest-title": "VIP Направления", 
        "fleet-title": "Наш Элитный Автопарк", "driver-title": "Наши Водители", "driver-touch": "НАЖМИТЕ ДЛЯ ВИЗИТКИ", 
        "fleet-photos": "ФОТОГРАФИИ", "fleet-video": "СМОТРЕТЬ ВИДЕО", "f1-desc": "Вместимость 7+1 | Кожаные сиденья | Мини-бар", "f2-desc": "7+1 Ультра Люкс | Кожаные сиденья | Мини-бар",
        "rev-title": "Отзывы Гостей", "faq-title": "Частые Вопросы", "q1": "Как найти вас в аэропорту?", "a1": "Мы ждем вас на выходе с табличкой.", "q2": "Если мой рейс задержится?", "a2": "Мы отслеживаем рейс и ждем бесплатно.", 
        "form-title": "VIP Бронирование", "form-send": "ОТПРАВИТЬ ДАННЫЕ", "p-name": "ВАШЕ ИМЯ И ФАМИЛИЯ", "p-mail": "ЭЛ. ПОЧТА", "p-date": "📅 ВЫБЕРИТЕ ДАТУ И ВРЕМЯ", "p-msg": "ОСОБЫЕ ПОЖЕЛАНИЯ..." 
    },
    de: { 
        "hero-title": "Grenzenloser Komfort", "hero-desc": "Antalyas Luxustransfer-Adresse.", "hero-btn": "JETZT BUCHEN", 
        "stat-1": "Zufriedene Gäste", "stat-2": "Luxusautos", "stat-3": "Stunden Support", 
        "treats-title": "Premium-Leistungen", "treat-water": "Getränke & Wasser", "treat-wifi": "Highspeed WLAN", 
        "spec-1": "Business Transfer", "spec-3": "Nachttouren", "dest-title": "VIP-Ziele", 
        "fleet-title": "Unser Luxus-Fuhrpark", "driver-title": "Unsere Chauffeure", "driver-touch": "FÜR VISITENKARTE TIPPEN", 
        "fleet-photos": "FOTOS", "fleet-video": "VIDEO ANSEHEN", "f1-desc": "7+1 Kapazität | Ledersitze | Minibar", "f2-desc": "7+1 Ultra Luxus | Ledersitze | Minibar",
        "rev-title": "Gästeerfahrungen", "faq-title": "Häufige Fragen", "q1": "Wie finde ich Sie am Flughafen?", "a1": "Wir warten am Ausgang mit einem Namensschild.", "q2": "Was ist bei Flugverspätung?", "a2": "Wir verfolgen den Flug und warten ohne Aufpreis.", 
        "form-title": "VIP-Buchung", "form-send": "DATEN SENDEN", "p-name": "NAME UND NACHNAME", "p-mail": "E-MAIL", "p-date": "📅 DATUM & UHRZEIT WÄHLEN", "p-msg": "BESONDERE WÜNSCHE..." 
    }
};

function setLanguage(lang, btn) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        } else if (translations['tr'][key]) {
            el.innerText = translations['tr'][key]; 
        }
    });

    const safeLang = (translations[lang] && translations[lang]['p-name']) ? lang : 'tr';
    const fName = document.getElementById('f-name');
    const fMail = document.getElementById('f-mail');
    const fDate = document.getElementById('f-date');
    const fMsg = document.getElementById('f-msg');

    if(fName) fName.placeholder = translations[safeLang]['p-name'];
    if(fMail) fMail.placeholder = translations[safeLang]['p-mail'];
    if(fDate) fDate.placeholder = translations[safeLang]['p-date'];
    if(fMsg) fMsg.placeholder = translations[safeLang]['p-msg'];
    
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = '#ccc';
        b.style.borderBottom = 'none';
    });
    if(btn) {
        btn.classList.add('active');
        btn.style.color = '#D4AF37';
    }
}

// --- 2. CANLI SAAT ---
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const liveTimeEl = document.getElementById('live-time');
    if (liveTimeEl) liveTimeEl.textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// --- 3. SLIDER ---
let slideIndex = 0;
const slides = document.querySelectorAll('.testi-slide');
function showSlides() {
    if(slides.length === 0) return;
    slides.forEach(s => s.classList.remove('active'));
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].classList.add('active');
    setTimeout(showSlides, 5000); 
}
showSlides();

// --- 4. TAKVİM (FLATPICKR) ---
if(document.getElementById("f-date")) {
    flatpickr("#f-date", { enableTime: true, dateFormat: "d.m.Y H:i", time_24hr: true, minDate: "today" });
}

// --- 5. EKRAN MODALLARI ---
function toggleFAQ(el) { el.parentElement.classList.toggle('active'); }
function openDriverModal(name, role, img, desc, phone, email) {
    const modal = document.getElementById("driverModal"); 
    if(modal) {
        modal.style.display = "block";
        document.getElementById("m-driver-data").innerHTML = `<img src="${img}" style="width:120px; height:120px; border-radius:50%; border:2px solid #D4AF37; margin-bottom:15px; object-fit:cover;"><h3 style="color:#D4AF37; font-family:'Cinzel'; margin-bottom:5px;">${name}</h3><h4 style="color:#fff; font-weight:300; margin-bottom:15px; font-size:0.9rem;">${role}</h4><p style="color:#aaa; margin-bottom:25px; font-size:0.9rem;">${desc}</p><div style="display:flex; flex-direction:column; gap:10px;"><a href="tel:${phone}" style="background:#0a0a0a; color:#D4AF37; display:block; padding:15px; border:1px solid #D4AF37; text-decoration:none; font-weight:bold;"><i class="fa-solid fa-phone"></i> HEMEN ARA</a><a href="mailto:${email}" style="background:#0a0a0a; color:#fff; display:block; padding:15px; border:1px solid #333; text-decoration:none;"><i class="fa-solid fa-envelope"></i> E-POSTA</a></div>`;
    }
}
function openVideoModal(src) { const v = document.getElementById("fleetVideo"); if(v) { v.src = src; document.getElementById("videoModal").style.display = "block"; v.play(); } }
function openGalleryModal(src) { const m = document.getElementById("imageModal"); if(m) { m.style.display = "block"; document.getElementById("expandedImg").src = src; } }
function closeModals() {
