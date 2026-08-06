(() => {
  "use strict";
  const cfg = window.ASEL_CONFIG || {};
  const apiBase = String(cfg.apiBase || "").replace(/\/$/, "");
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  async function request(path, options = {}) {
    if (!apiBase || apiBase.includes("YOUR-SUBDOMAIN")) {
      throw new Error("API adresi henüz yapılandırılmadı. assets/js/config.js dosyasını güncelleyin.");
    }
    const response = await fetch(apiBase + path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    return payload;
  }

  function showStatus(target, message, type = "info") {
    if (!target) return;
    target.textContent = message;
    target.className = `platform-status ${type}`;
    target.hidden = false;
  }

  function bindBookingForm() {
    const form = $("#bookingForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const status = $("#bookingApiStatus");
      const submitButton = form.querySelector('[type="submit"]');

      if (!form.reportValidity()) return;

      const raw = Object.fromEntries(new FormData(form));

      const routes = {
        "airport-kemer": {
          pickup: "Antalya Havalimanı",
          dropoff: "Kemer"
        },
        "airport-beldibi": {
          pickup: "Antalya Havalimanı",
          dropoff: "Beldibi"
        },
        "airport-belek": {
          pickup: "Antalya Havalimanı",
          dropoff: "Belek"
        },
        "airport-side": {
          pickup: "Antalya Havalimanı",
          dropoff: "Side"
        },
        "airport-alanya": {
          pickup: "Antalya Havalimanı",
          dropoff: "Alanya"
        },
        "gazipasa-alanya": {
          pickup: "Gazipaşa Havalimanı",
          dropoff: "Alanya"
        },
        "custom": {
          pickup: "Özel rota",
          dropoff: raw.customRoute || "Belirtilmedi"
        }
      };

      const selectedRoute =
        routes[raw.route] || routes.custom;

      const apiData = {
        customer_name: raw.name,
        customer_email: raw.email || "",
        customer_phone: raw.phone,
        pickup_location: selectedRoute.pickup,
        dropoff_location: selectedRoute.dropoff,
        pickup_date: raw.date,
        pickup_time: raw.time,
        passenger_count: Number(raw.passengers || 1),
        vehicle_type: raw.vehicle || "vito",
        trip_type: raw.trip || "one",
        flight_number: raw.flight || "",
        customer_note: raw.notes || "",
        estimated_price: raw.estimatedPrice
          ? Number(raw.estimatedPrice)
          : null,
        currency: "EUR"
      };

      submitButton.disabled = true;
      showStatus(status, "Rezervasyon kaydediliyor…");

      try {
        // Önce merkezi veritabanına kaydet.
        const result = await request("/api/bookings", {
          method: "POST",
          body: JSON.stringify(apiData)
        });

        // Rezervasyon kodunu Formspree mesajına da ekle.
        const emailData = new FormData(form);
        emailData.append(
          "booking_code",
          result.booking_code
        );
        emailData.append(
          "booking_status",
          result.status_label || "Bekliyor"
        );
        emailData.append(
          "pickup_location",
          apiData.pickup_location
        );
        emailData.append(
          "dropoff_location",
          apiData.dropoff_location
        );

        let emailSent = false;

        try {
          const emailResponse = await fetch(form.action, {
            method: "POST",
            body: emailData,
            headers: {
              Accept: "application/json"
            }
          });

          emailSent = emailResponse.ok;
        } catch {
          emailSent = false;
        }

        const emailMessage = emailSent
          ? " E-posta bildirimi de gönderildi."
          : " Rezervasyon kaydedildi ancak e-posta bildirimi gönderilemedi.";

        showStatus(
          status,
          `Talebiniz alındı. Rezervasyon kodu: ${result.booking_code}.${emailMessage}`,
          emailSent ? "success" : "info"
        );

        form.reset();

        const priceValue = $("#priceValue");
        if (priceValue) priceValue.textContent = "€0";

      } catch (error) {
        showStatus(
          status,
          error.message || "Rezervasyon oluşturulamadı.",
          "error"
        );
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  function bindTracking() {
    const form = $("#trackingForm");
    const resultBox = $("#trackingResult");
    if (!form || !resultBox) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      showStatus(resultBox, "Rezervasyon aranıyor…");
      try {
        const result = await request(`/api/bookings/${encodeURIComponent(data.code)}?phone_last_four=${encodeURIComponent(data.phone_last_four)}`);
        resultBox.hidden = false;
        resultBox.className = "platform-status success";
        resultBox.innerHTML = `
          <strong>${result.booking_code}</strong><br>
          Durum: ${result.status_label}<br>
          Rota: ${result.pickup_location} → ${result.dropoff_location}<br>
          Tarih: ${result.pickup_date} ${result.pickup_time}<br>
          Araç: ${result.vehicle_label || "Henüz atanmadı"}<br>
          Şoför: ${result.driver_name || "Henüz atanmadı"}
        `;
      } catch (error) {
        showStatus(resultBox, error.message, "error");
      }
    });
  }

  function bookingRow(item) {
    return `<tr>
      <td><strong>${item.booking_code}</strong><br><small>${item.created_at}</small></td>
      <td>${item.customer_name}<br><small>${item.customer_phone}</small></td>
      <td>${item.pickup_location} → ${item.dropoff_location}<br><small>${item.pickup_date} ${item.pickup_time}</small></td>
      <td><span class="status-pill status-${item.status}">${item.status_label}</span></td>
      <td>
        <select data-status-id="${item.id}" aria-label="Rezervasyon durumu">
          ${["pending","confirmed","driver_assigned","on_the_way","passenger_onboard","completed","cancelled"].map(s => `<option value="${s}" ${s===item.status?"selected":""}>${s}</option>`).join("")}
        </select>
      </td>
    </tr>`;
  }

  async function loadAdminBookings() {
    const table = $("#adminBookingsBody");
    const status = $("#adminStatus");
    if (!table) return;
    showStatus(status, "Rezervasyonlar yükleniyor…");
    try {
      const result = await request("/api/admin/bookings");
      table.innerHTML = result.items.map(bookingRow).join("") || `<tr><td colspan="5">Kayıt bulunamadı.</td></tr>`;
      showStatus(status, `${result.items.length} rezervasyon yüklendi.`, "success");
      $$('[data-status-id]').forEach(select => select.addEventListener('change', async () => {
        select.disabled = true;
        try {
          await request(`/api/admin/bookings/${select.dataset.statusId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: select.value }),
          });
          showStatus(status, "Durum güncellendi.", "success");
        } catch (error) {
          showStatus(status, error.message, "error");
        } finally {
          select.disabled = false;
        }
      }));
    } catch (error) {
      table.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
      showStatus(status, error.message, "error");
    }
  }

  async function loadDriverJobs() {
    const box = $("#driverJobs");
    const status = $("#driverStatus");
    if (!box) return;
    showStatus(status, "Görevler yükleniyor…");
    try {
      const result = await request("/api/driver/jobs");
      box.innerHTML = result.items.map(item => `
        <article class="job-card">
          <h3>${item.pickup_time} · ${item.booking_code}</h3>
          <p>${item.pickup_location} → ${item.dropoff_location}</p>
          <p>${item.customer_name} · ${item.customer_phone}</p>
          <p>Durum: <strong>${item.status_label}</strong></p>
          <div class="job-actions">
            <button data-job="${item.id}" data-next="on_the_way">Yola çıktım</button>
            <button data-job="${item.id}" data-next="passenger_onboard">Müşteriyi aldım</button>
            <button data-job="${item.id}" data-next="completed">Tamamlandı</button>
          </div>
        </article>`).join("") || "<p>Bugün atanmış görev bulunmuyor.</p>";
      $$('[data-job]').forEach(btn => btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await request(`/api/driver/jobs/${btn.dataset.job}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: btn.dataset.next }),
          });
          await loadDriverJobs();
        } catch (error) {
          showStatus(status, error.message, "error");
        } finally { btn.disabled = false; }
      }));
      showStatus(status, `${result.items.length} görev yüklendi.`, "success");
    } catch (error) {
      showStatus(status, error.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindBookingForm();
    bindTracking();
    loadAdminBookings();
    loadDriverJobs();
  });
})();
