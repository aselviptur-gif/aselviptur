# Asel VIP Tur Platform — Yayınlama Rehberi

Bu paket iki parçadan oluşur:
1. Statik web sitesi (repo kökü)
2. Cloudflare Worker + D1 backend (`backend/`)

## 1. Ön yüz
Repo kökünü Cloudflare Pages projesine bağlayın. Build komutu gerekmez; çıktı dizini `/` olur.

## 2. D1
Cloudflare Dashboard → Storage & Databases → D1 → Create Database.
Ad: `aselviptur-production`
SQL Console'a `backend/migrations/0001_initial.sql` içeriğini çalıştırın.

## 3. Worker
Dashboard → Workers & Pages → Create Worker.
`backend/src/index.js` içeriğini Edit Code ekranına yapıştırın.
Bindings bölümünde `DB` adıyla D1 veritabanını bağlayın.
Variables bölümüne:
- `ALLOWED_ORIGIN=https://aselviptur.com`
- `ADMIN_EMAILS=yetkili@aselviptur.com`
- `DRIVER_EMAILS=sofor1@aselviptur.com,sofor2@aselviptur.com`

## 4. Cloudflare Access
`/admin.html` yolunu Cloudflare Access ile koruyun. Kimlik doğrulaması sonrası Cloudflare Worker'a `Cf-Access-Authenticated-User-Email` başlığı gönderilir.

## 5. API bağlantısı
Worker deploy edildikten sonra `assets/js/config.js` içindeki `apiBase` değerini Worker URL'siyle değiştirin.

## 6. Önemli doğrulamalar
- WhatsApp numarası
- Formspree hesabı
- E-posta adresleri
- Rota fiyatları
- Gerçek şoför e-postaları
- Gerçek araç/plaka kayıtları

Bu dosyalar gerekli tüm kaynak kodu içerir; ancak Cloudflare hesabında D1, Worker binding ve Access yapılandırması yapılmadan canlı veri akışı oluşmaz.
