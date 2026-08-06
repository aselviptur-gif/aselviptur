# Asel VIP Tur v4.1 PRO

Cloudflare Pages/GitHub üzerinde yayınlanmaya hazır statik sürüm.

## Üretim özellikleri
- Premium mobil uyumlu sayfalar
- Tahmini fiyat hesaplama
- WhatsApp ve Formspree rezervasyon talebi
- SEO, Open Graph, LocalBusiness yapılandırılmış verisi
- Cloudflare Pages güvenlik/cache başlıkları
- robots.txt, sitemap.xml, manifest ve security.txt

## Bilerek yayına alınmayanlar
Gerçek veritabanı olmadığı için demo yönetim paneli ve cihaz-yerel rezervasyon takip sayfası üretim paketinden çıkarılmıştır. Bu özellikler ancak kimlik doğrulamalı backend ile güvenli biçimde eklenmelidir.

## Yayın öncesi doğrulama
1. `info@aselviptur.com` ve `security@aselviptur.com` adreslerini doğrulayın.
2. Formspree form kimliğinin işletme hesabınıza ait olduğunu doğrulayın.
3. `assets/js/app.js` içindeki rota fiyatlarını ve WhatsApp numarasını doğrulayın.
4. Metinlerdeki hizmet iddiaları ile araç kapasitesi/fiyatların gerçek operasyonla uyumunu kontrol edin.

## Yerel test
```bash
python -m http.server 8080
```
