(() => {
  "use strict";

  const API_BASE =
    window.ASEL_CONFIG?.apiBase ||
    "https://aselviptur-api.aselviptur.workers.dev";

  const $ = (selector) => document.querySelector(selector);

  const state = {
    adminToken: sessionStorage.getItem("asel_admin_token") || "",
    bookings: [],
    drivers: [],
    vehicles: [],
    dashboard: null,
    quickAssignBookingId: null,
    autoRefreshTimer: null
  };

  const STATUS_LABELS = {
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    driver_assigned: "Şoföre Atandı",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showMessage(message, type = "info") {
    const box = $("#adminMessage");
    if (!box) return;

    box.textContent = message;
    box.dataset.type = type;
    box.hidden = false;
  }

  function clearMessage() {
    const box = $("#adminMessage");
    if (!box) return;

    box.hidden = true;
    box.textContent = "";
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(
          state.adminToken
            ? {
                Authorization:
                  `Bearer ${state.adminToken}`
              }
            : {}
        ),
        ...(options.headers || {})
      }
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("API geçersiz yanıt döndürdü.");
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.error ||
        `İstek başarısız oldu (${response.status}).`
      );
    }

    return data;
  }


  async function loginRequest(adminKey) {
    const response = await fetch(
      `${API_BASE}/api/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          admin_key: adminKey
        })
      }
    );

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      throw new Error(
        "Giriş servisi geçersiz yanıt döndürdü."
      );
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.error ||
        `Giriş başarısız oldu (${response.status}).`
      );
    }

    if (!data.token) {
      throw new Error(
        "Yönetici oturum anahtarı alınamadı."
      );
    }

    return data;
  }


  function formatPrice(value, currency = "EUR") {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency
    }).format(Number(value));
  }

  function formatDate(date, time) {
    if (!date) return "-";
    return `${date}${time ? ` ${time}` : ""}`;
  }

  function buildDriverOptions(selectedId = null) {
    const options = [
      '<option value="">Şoför seçin</option>'
    ];

    for (const driver of state.drivers) {
      options.push(`
        <option
          value="${driver.id}"
          ${Number(selectedId) === Number(driver.id) ? "selected" : ""}
        >
          ${escapeHtml(driver.full_name)}
        </option>
      `);
    }

    return options.join("");
  }

  function buildVehicleOptions(selectedId = null) {
    const options = [
      '<option value="">Araç seçin</option>'
    ];

    for (const vehicle of state.vehicles) {
      const label = vehicle.plate
        ? `${vehicle.label} - ${vehicle.plate}`
        : vehicle.label;

      options.push(`
        <option
          value="${vehicle.id}"
          ${Number(selectedId) === Number(vehicle.id) ? "selected" : ""}
        >
          ${escapeHtml(label)}
        </option>
      `);
    }

    return options.join("");
  }

  function renderBookings() {
    const container = $("#bookingList");
    const empty = $("#bookingEmpty");

    if (!container || !empty) return;

    container.innerHTML = "";

    if (!state.bookings.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    for (const booking of state.bookings) {
      const card = document.createElement("article");
      card.className = "admin-booking-card";
      card.dataset.bookingId = booking.id;

      card.innerHTML = `
        <div class="admin-booking-head">
          <div>
            <strong>${escapeHtml(booking.booking_code)}</strong>
            <span class="status-badge status-${escapeHtml(booking.status)}">
              ${escapeHtml(
                booking.status_label ||
                STATUS_LABELS[booking.status] ||
                booking.status
              )}
            </span>
          </div>

          <div class="admin-booking-date">
            ${escapeHtml(
              formatDate(
                booking.pickup_date,
                booking.pickup_time
              )
            )}
          </div>
        </div>

        <div class="admin-booking-grid">
          <div>
            <span>Müşteri</span>
            <strong>${escapeHtml(booking.customer_name)}</strong>
          </div>

          <div>
            <span>Telefon</span>
            <a href="tel:${escapeHtml(booking.customer_phone)}">
              ${escapeHtml(booking.customer_phone)}
            </a>
          </div>

          <div>
            <span>Rota</span>
            <strong>
              ${escapeHtml(booking.pickup_location)}
              →
              ${escapeHtml(booking.dropoff_location)}
            </strong>
          </div>

          <div>
            <span>Yolcu</span>
            <strong>${escapeHtml(booking.passenger_count)}</strong>
          </div>

          <div>
            <span>Uçuş</span>
            <strong>${escapeHtml(booking.flight_number || "-")}</strong>
          </div>

          <div>
            <span>Tahmini ücret</span>
            <strong>
              ${escapeHtml(
                formatPrice(
                  booking.estimated_price,
                  booking.currency || "EUR"
                )
              )}
            </strong>
          </div>
        </div>

        <div class="admin-booking-note">
          <span>Müşteri notu</span>
          <p>${escapeHtml(booking.customer_note || "-")}</p>
        </div>

        <div class="admin-assignment-info">
          ${
            booking.driver_name
              ? `Atanan şoför: ${escapeHtml(booking.driver_name)}`
              : "Henüz şoför atanmadı."
          }

          ${
            booking.vehicle_label
              ? `<br>Araç: ${escapeHtml(
                  booking.vehicle_label
                )} ${escapeHtml(
                  booking.vehicle_plate || ""
                )}`
              : ""
          }
        </div>
      `;

      container.appendChild(card);
    }
  }


  function setText(selector, value) {
    const element = $(selector);

    if (element) {
      element.textContent = String(value);
    }
  }

  function normalizeWhatsappPhone(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function buildCustomerWhatsappUrl(booking) {
    const phone = normalizeWhatsappPhone(
      booking.customer_phone
    );

    if (!phone) return "";

    const message = [
      "Merhaba, Asel VIP Tur rezervasyonunuz hakkında iletişime geçiyoruz.",
      "",
      `Rezervasyon: ${booking.booking_code}`,
      `Tarih: ${booking.pickup_date}`,
      `Saat: ${booking.pickup_time}`,
      `Rota: ${booking.pickup_location} → ${booking.dropoff_location}`
    ].join("\n");

    return (
      `https://wa.me/${phone}` +
      `?text=${encodeURIComponent(message)}`
    );
  }

  function renderTodayBookings(bookings = []) {
    const container = $("#todayBookingList");
    const empty = $("#todayBookingEmpty");

    if (!container || !empty) return;

    container.innerHTML = "";

    if (!bookings.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    for (const booking of bookings) {
      const item = document.createElement("article");
      item.className = "today-booking-item";
      item.dataset.bookingId = booking.id;

      const phoneUrl = booking.customer_phone
        ? `tel:${booking.customer_phone}`
        : "";

      const whatsappUrl =
        buildCustomerWhatsappUrl(booking);

      item.innerHTML = `
        <div class="today-booking-time">
          ${escapeHtml(booking.pickup_time || "-")}
        </div>

        <div class="today-booking-main">
          <strong>${escapeHtml(booking.customer_name)}</strong>

          <span>
            ${escapeHtml(
              booking.flight_number || "Uçuş bilgisi yok"
            )}
            ·
            ${escapeHtml(booking.passenger_count || 1)} yolcu
          </span>

          <span>
            ${escapeHtml(booking.pickup_location)}
            →
            ${escapeHtml(booking.dropoff_location)}
          </span>

          <span>
            ${
              booking.driver_name
                ? `Şoför: ${escapeHtml(booking.driver_name)}`
                : "Şoför atanmadı"
            }
          </span>

          <span>
            ${
              booking.vehicle_label
                ? `Araç: ${escapeHtml(
                    booking.vehicle_label
                  )} ${escapeHtml(
                    booking.vehicle_plate || ""
                  )}`
                : "Araç atanmadı"
            }
          </span>
        </div>

        <div class="today-booking-side">
          <span class="status-badge status-${escapeHtml(booking.status)}">
            ${escapeHtml(
              booking.status_label ||
              STATUS_LABELS[booking.status] ||
              booking.status
            )}
          </span>

          <div class="today-booking-actions">
            ${
              phoneUrl
                ? `
                  <a
                    class="button"
                    href="${escapeHtml(phoneUrl)}"
                  >
                    Ara
                  </a>
                `
                : ""
            }

            ${
              whatsappUrl
                ? `
                  <a
                    class="button"
                    href="${escapeHtml(whatsappUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                `
                : ""
            }

            <button
              type="button"
              class="button"
              data-today-action="detail"
            >
              Detay
            </button>

            ${
              booking.status === "pending"
                ? `
                  <button
                    type="button"
                    class="button"
                    data-today-action="assign"
                  >
                    Şoföre Ata
                  </button>
                `
                : ""
            }

            ${
              booking.status !== "completed" &&
              booking.status !== "cancelled"
                ? `
                  <button
                    type="button"
                    class="button"
                    data-today-action="complete"
                  >
                    Tamamlandı
                  </button>

                  <button
                    type="button"
                    class="button button-danger"
                    data-today-action="cancel"
                  >
                    İptal
                  </button>
                `
                : ""
            }
          </div>
        </div>
      `;

      container.appendChild(item);
    }
  }


  function localDateTime(date, time) {
    if (!date || !time) return null;

    const value = new Date(`${date}T${time}:00`);

    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  function minutesUntilBooking(booking) {
    const bookingDate = localDateTime(
      booking.pickup_date,
      booking.pickup_time
    );

    if (!bookingDate) return null;

    return Math.round(
      (bookingDate.getTime() - Date.now()) / 60000
    );
  }

  function urgencyInfo(minutes) {
    if (minutes === null) {
      return {
        label: "Saat bilgisi yok",
        className: ""
      };
    }

    if (minutes < 0) {
      return {
        label: `${Math.abs(minutes)} dk gecikmiş`,
        className: "alert-overdue"
      };
    }

    if (minutes <= 30) {
      return {
        label: `${minutes} dk kaldı`,
        className: "alert-critical"
      };
    }

    return {
      label: `${minutes} dk kaldı`,
      className: "alert-upcoming"
    };
  }

  function renderUpcomingTransfers(bookings = []) {
    const container = $("#upcomingTransferList");
    const empty = $("#upcomingTransferEmpty");

    if (!container || !empty) return;

    container.innerHTML = "";

    const upcoming = bookings
      .map((booking) => ({
        booking,
        minutes: minutesUntilBooking(booking)
      }))
      .filter(({ booking, minutes }) => (
        booking.status !== "completed" &&
        booking.status !== "cancelled" &&
        minutes !== null &&
        minutes <= 120
      ))
      .sort((a, b) => a.minutes - b.minutes);

    if (!upcoming.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    for (const { booking, minutes } of upcoming) {
      const urgency = urgencyInfo(minutes);
      const item = document.createElement("article");

      item.className =
        `operation-alert-item ${urgency.className}`;

      item.dataset.bookingId = booking.id;

      const phone = booking.customer_phone
        ? `tel:${booking.customer_phone}`
        : "";

      const whatsapp =
        buildCustomerWhatsappUrl(booking);

      item.innerHTML = `
        <div class="operation-alert-time">
          ${escapeHtml(urgency.label)}
        </div>

        <div class="operation-alert-main">
          <strong>
            ${escapeHtml(booking.pickup_time || "-")}
            ·
            ${escapeHtml(booking.customer_name)}
          </strong>

          <span>
            ${escapeHtml(booking.pickup_location)}
            →
            ${escapeHtml(booking.dropoff_location)}
          </span>

          <span>
            ${
              booking.driver_name
                ? `Şoför: ${escapeHtml(booking.driver_name)}`
                : "Şoför atanmadı"
            }
          </span>
        </div>

        <div class="operation-alert-actions">
          ${
            phone
              ? `<a class="button" href="${escapeHtml(phone)}">Ara</a>`
              : ""
          }

          ${
            whatsapp
              ? `
                <a
                  class="button"
                  href="${escapeHtml(whatsapp)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              `
              : ""
          }

          <button
            type="button"
            class="button"
            data-operation-action="detail"
          >
            Detay
          </button>

          ${
            booking.status === "pending"
              ? `
                <button
                  type="button"
                  class="button"
                  data-operation-action="quick-assign"
                >
                  Hızlı Ata
                </button>
              `
              : ""
          }

          <button
            type="button"
            class="button"
            data-operation-action="complete"
          >
            Tamamlandı
          </button>

          <button
            type="button"
            class="button button-danger"
            data-operation-action="cancel"
          >
            İptal
          </button>
        </div>
      `;

      container.appendChild(item);
    }
  }

  function renderTimeline(bookings = []) {
    const container = $("#operationTimeline");

    if (!container) return;

    container.innerHTML = "";

    setText(
      "#timelineCount",
      `${bookings.length} transfer`
    );

    for (const booking of bookings) {
      const item = document.createElement("article");
      item.className = "timeline-item";

      item.innerHTML = `
        <div class="timeline-time">
          ${escapeHtml(booking.pickup_time || "-")}
        </div>

        <div class="timeline-marker">
          <span class="timeline-dot"></span>
        </div>

        <div class="timeline-content">
          <strong>${escapeHtml(booking.customer_name)}</strong>

          <span>
            ${escapeHtml(booking.pickup_location)}
            →
            ${escapeHtml(booking.dropoff_location)}
          </span>

          <span>
            ${
              booking.driver_name
                ? `Şoför: ${escapeHtml(booking.driver_name)}`
                : "Şoför bekleniyor"
            }
            ·
            ${escapeHtml(
              booking.status_label ||
              STATUS_LABELS[booking.status] ||
              booking.status
            )}
          </span>
        </div>
      `;

      container.appendChild(item);
    }
  }


  function findBookingById(bookingId) {
    const id = Number(bookingId);

    return (
      state.dashboard?.today_bookings?.find(
        (booking) => Number(booking.id) === id
      ) ||
      state.bookings.find(
        (booking) => Number(booking.id) === id
      ) ||
      null
    );
  }

  function openBookingDetailModal(bookingId) {
    const booking = findBookingById(bookingId);

    if (!booking) {
      showMessage(
        "Rezervasyon detayı bulunamadı.",
        "error"
      );
      return;
    }

    const content = $("#bookingDetailContent");

    if (!content) return;

    const customerWhatsapp =
      buildCustomerWhatsappUrl(booking);

    const phoneLink = booking.customer_phone
      ? `tel:${booking.customer_phone}`
      : "";

    content.innerHTML = `
      <div class="booking-detail-grid">
        <div class="booking-detail-item">
          <span>Rezervasyon kodu</span>
          <strong>${escapeHtml(booking.booking_code || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Durum</span>
          <strong>
            ${escapeHtml(
              booking.status_label ||
              STATUS_LABELS[booking.status] ||
              booking.status ||
              "-"
            )}
          </strong>
        </div>

        <div class="booking-detail-item">
          <span>Müşteri</span>
          <strong>${escapeHtml(booking.customer_name || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Telefon</span>
          <strong>${escapeHtml(booking.customer_phone || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>E-posta</span>
          <strong>${escapeHtml(booking.customer_email || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Tarih ve saat</span>
          <strong>
            ${escapeHtml(
              formatDate(
                booking.pickup_date,
                booking.pickup_time
              )
            )}
          </strong>
        </div>

        <div class="booking-detail-item">
          <span>Alış noktası</span>
          <strong>${escapeHtml(booking.pickup_location || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Bırakış noktası</span>
          <strong>${escapeHtml(booking.dropoff_location || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Uçuş</span>
          <strong>${escapeHtml(booking.flight_number || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Yolcu sayısı</span>
          <strong>${escapeHtml(booking.passenger_count || 1)}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Araç tercihi</span>
          <strong>${escapeHtml(booking.vehicle_type || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Tahmini ücret</span>
          <strong>
            ${escapeHtml(
              formatPrice(
                booking.estimated_price,
                booking.currency || "EUR"
              )
            )}
          </strong>
        </div>

        <div class="booking-detail-item">
          <span>Atanan şoför</span>
          <strong>${escapeHtml(booking.driver_name || "Henüz atanmadı")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Şoför telefonu</span>
          <strong>${escapeHtml(booking.driver_phone || "-")}</strong>
        </div>

        <div class="booking-detail-item">
          <span>Atanan araç</span>
          <strong>
            ${
              booking.vehicle_label
                ? `${escapeHtml(booking.vehicle_label)}
                   ${escapeHtml(booking.vehicle_plate || "")}`
                : "Henüz atanmadı"
            }
          </strong>
        </div>

        <div class="booking-detail-item">
          <span>Oluşturulma</span>
          <strong>${escapeHtml(booking.created_at || "-")}</strong>
        </div>
      </div>

      <div class="booking-detail-note">
        <span>Müşteri notu</span>
        <p>${escapeHtml(booking.customer_note || "-")}</p>
      </div>

      <div class="booking-detail-note">
        <span>Yönetici notu</span>
        <p>${escapeHtml(booking.admin_note || "-")}</p>
      </div>

      <div class="booking-detail-contact">
        ${
          phoneLink
            ? `
              <a
                class="button"
                href="${escapeHtml(phoneLink)}"
              >
                Müşteriyi Ara
              </a>
            `
            : ""
        }

        ${
          customerWhatsapp
            ? `
              <a
                class="button"
                href="${escapeHtml(customerWhatsapp)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Müşteriye WhatsApp
              </a>
            `
            : ""
        }
      </div>
    `;

    $("#bookingDetailModal")?.removeAttribute("hidden");
  }

  function closeBookingDetailModal() {
    $("#bookingDetailModal")?.setAttribute("hidden", "");
  }

  function openQuickAssignModal(bookingId) {
    const booking = state.dashboard
      ?.today_bookings
      ?.find(
        (item) =>
          Number(item.id) === Number(bookingId)
      );

    if (!booking) {
      showMessage(
        "Atama yapılacak rezervasyon bulunamadı.",
        "error"
      );
      return;
    }

    state.quickAssignBookingId = Number(bookingId);

    const driverSelect = $("#quickAssignDriver");
    const vehicleSelect = $("#quickAssignVehicle");

    if (driverSelect) {
      driverSelect.innerHTML =
        buildDriverOptions(
          booking.assigned_driver_id
        );
    }

    if (vehicleSelect) {
      vehicleSelect.innerHTML =
        buildVehicleOptions(
          booking.assigned_vehicle_id
        );
    }

    const info = $("#quickAssignBookingInfo");

    if (info) {
      info.innerHTML = `
        <strong>${escapeHtml(booking.customer_name)}</strong><br>
        ${escapeHtml(booking.pickup_date)}
        ${escapeHtml(booking.pickup_time)}<br>
        ${escapeHtml(booking.pickup_location)}
        →
        ${escapeHtml(booking.dropoff_location)}<br>
        ${escapeHtml(booking.flight_number || "Uçuş bilgisi yok")}
      `;
    }

    $("#quickAssignModal")?.removeAttribute("hidden");
  }

  function closeQuickAssignModal() {
    state.quickAssignBookingId = null;
    $("#quickAssignModal")?.setAttribute("hidden", "");
  }

  async function submitQuickAssign() {
    const bookingId = state.quickAssignBookingId;
    const driverId = Number(
      $("#quickAssignDriver")?.value || 0
    );

    const rawVehicleId =
      $("#quickAssignVehicle")?.value || "";

    if (!bookingId) {
      throw new Error("Rezervasyon seçilmedi.");
    }

    if (!driverId) {
      throw new Error("Bir şoför seçmelisin.");
    }

    const result = await apiRequest(
      `/api/admin/bookings/${bookingId}/assign`,
      {
        method: "PATCH",
        body: JSON.stringify({
          driver_id: driverId,
          vehicle_id: rawVehicleId
            ? Number(rawVehicleId)
            : null
        })
      }
    );

    closeQuickAssignModal();

    await Promise.all([
      loadDashboard(),
      loadBookings()
    ]);

    if (result.whatsapp_url) {
      window.open(
        result.whatsapp_url,
        "_blank",
        "noopener,noreferrer"
      );
    }

    showMessage(
      "Şoför ve araç ataması tamamlandı.",
      "success"
    );
  }

  async function completeOperationBooking(bookingId) {
    await apiRequest(
      `/api/admin/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "completed",
          admin_note:
            "Operasyon panelinden tamamlandı."
        })
      }
    );

    await Promise.all([
      loadDashboard(),
      loadBookings()
    ]);

    showMessage(
      "Transfer tamamlandı olarak işaretlendi.",
      "success"
    );
  }

  async function handleOperationAction(event) {
    const button = event.target.closest(
      "[data-operation-action]"
    );

    if (!button) return;

    const item = button.closest(
      ".operation-alert-item"
    );

    if (!item) return;

    const bookingId = Number(item.dataset.bookingId);

    try {
      if (
        button.dataset.operationAction ===
        "detail"
      ) {
        openBookingDetailModal(bookingId);
      }

      if (
        button.dataset.operationAction ===
        "quick-assign"
      ) {
        openQuickAssignModal(bookingId);
      }

      if (
        button.dataset.operationAction ===
        "complete"
      ) {
        button.disabled = true;
        await completeOperationBooking(bookingId);
      }

      if (
        button.dataset.operationAction ===
        "cancel"
      ) {
        const approved = confirm(
          "Bu transferi iptal etmek istediğine emin misin?"
        );

        if (!approved) return;

        button.disabled = true;

        await apiRequest(
          `/api/admin/bookings/${bookingId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "cancelled",
              admin_note:
                "Yaklaşan transfer ekranından iptal edildi."
            })
          }
        );

        await Promise.all([
          loadDashboard(),
          loadBookings()
        ]);

        showMessage(
          "Transfer iptal edildi.",
          "success"
        );
      }
    } catch (error) {
      showMessage(
        error.message || "İşlem başarısız.",
        "error"
      );
    } finally {
      button.disabled = false;
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();

    const toggle = $("#autoRefreshToggle");

    if (toggle && !toggle.checked) {
      return;
    }

    state.autoRefreshTimer = window.setInterval(
      async () => {
        if (!state.adminToken) return;

        try {
          await Promise.all([
            loadDashboard(),
            loadBookings()
          ]);
        } catch (error) {
          console.error(
            "Otomatik yenileme hatası:",
            error
          );
        }
      },
      30000
    );
  }

  function stopAutoRefresh() {
    if (state.autoRefreshTimer) {
      window.clearInterval(
        state.autoRefreshTimer
      );

      state.autoRefreshTimer = null;
    }
  }

  function renderDashboard(data) {
    state.dashboard = data;

    const stats = data.stats || {};

    setText("#statPending", stats.pending || 0);
    setText("#statAssigned", stats.driver_assigned || 0);
    setText("#statCompleted", stats.completed || 0);
    setText("#statCancelled", stats.cancelled || 0);
    setText("#statToday", stats.today || 0);
    setText(
      "#statTodayUnassigned",
      stats.today_unassigned || 0
    );
    setText(
      "#statTodayPassengers",
      stats.today_passengers || 0
    );
    setText(
      "#statTodayRevenue",
      formatPrice(
        stats.today_revenue || 0,
        "EUR"
      )
    );
    setText("#statDrivers", stats.active_drivers || 0);
    setText("#statVehicles", stats.active_vehicles || 0);
    setText("#dashboardDate", data.date || "-");

    const todayBookings = data.today_bookings || [];

    renderTodayBookings(todayBookings);
    renderUpcomingTransfers(todayBookings);
    renderTimeline(todayBookings);
  }

  async function loadDashboard() {
    const result = await apiRequest(
      "/api/admin/dashboard"
    );

    renderDashboard(result);
  }

  async function loadReferenceData() {
    const [driversResult, vehiclesResult] = await Promise.all([
      apiRequest("/api/admin/drivers"),
      apiRequest("/api/admin/vehicles")
    ]);

    state.drivers = driversResult.drivers || [];
    state.vehicles = vehiclesResult.vehicles || [];
  }

  function buildQuery() {
    const params = new URLSearchParams();

    const status = $("#statusFilter")?.value || "";
    const date = $("#dateFilter")?.value || "";
    const search = $("#searchFilter")?.value.trim() || "";

    if (status && status !== "all") {
      params.set("status", status);
    }

    if (date) {
      params.set("date", date);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();
    return query ? `?${query}` : "";
  }

  async function loadBookings() {
    clearMessage();

    const result = await apiRequest(
      `/api/admin/bookings${buildQuery()}`
    );

    state.bookings = result.bookings || [];

    const count = $("#bookingCount");
    if (count) {
      count.textContent = String(result.count || 0);
    }

    renderBookings();
  }


  async function updateStatus(card, status) {
    const bookingId = card.dataset.bookingId;
    const adminNote =
      card.querySelector(".adminNote")?.value.trim() || "";

    await apiRequest(
      `/api/admin/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          admin_note: adminNote
        })
      }
    );

    await loadBookings();
  }


  async function handleTodayBookingAction(event) {
    const button = event.target.closest(
      "[data-today-action]"
    );

    if (!button) return;

    const item = button.closest(
      ".today-booking-item"
    );

    if (!item) return;

    const bookingId = Number(
      item.dataset.bookingId
    );

    const booking = state.dashboard
      ?.today_bookings
      ?.find(
        (entry) =>
          Number(entry.id) === bookingId
      );

    if (!booking) {
      showMessage(
        "Rezervasyon verisi bulunamadı.",
        "error"
      );
      return;
    }

    button.disabled = true;

    try {
      const action =
        button.dataset.todayAction;

      if (action === "detail") {
        openBookingDetailModal(bookingId);
      }

      if (action === "assign") {
        if ($("#dateFilter")) {
          $("#dateFilter").value =
            booking.pickup_date || "";
        }

        if ($("#searchFilter")) {
          $("#searchFilter").value =
            booking.booking_code || "";
        }

        await loadBookings();

        document
          .querySelector("#bookingList")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        showMessage(
          "Rezervasyon aşağıda açıldı. Şoför ve araç seçip Şoföre Ata butonuna bas.",
          "info"
        );
      }

      if (action === "complete") {
        await apiRequest(
          `/api/admin/bookings/${bookingId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "completed",
              admin_note:
                "Dashboard üzerinden tamamlandı."
            })
          }
        );

        await Promise.all([
          loadDashboard(),
          loadBookings()
        ]);

        showMessage(
          "Transfer tamamlandı olarak işaretlendi.",
          "success"
        );
      }

      if (action === "cancel") {
        const approved = confirm(
          "Bu transferi iptal etmek istediğine emin misin?"
        );

        if (!approved) return;

        await apiRequest(
          `/api/admin/bookings/${bookingId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "cancelled",
              admin_note:
                "Operasyon merkezinden iptal edildi."
            })
          }
        );

        await Promise.all([
          loadDashboard(),
          loadBookings()
        ]);

        showMessage(
          "Transfer iptal edildi.",
          "success"
        );
      }
    } catch (error) {
      showMessage(
        error.message || "İşlem başarısız.",
        "error"
      );
    } finally {
      button.disabled = false;
    }
  }

  async function handleBookingAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const card = button.closest(".admin-booking-card");
    if (!card) return;

    button.disabled = true;

    try {
      const action = button.dataset.action;

      if (action === "complete") {
        await updateStatus(card, "completed");
        showMessage(
          "Rezervasyon tamamlandı olarak işaretlendi.",
          "success"
        );
      }

      if (action === "cancel") {
        const approved = confirm(
          "Bu rezervasyonu iptal etmek istediğine emin misin?"
        );

        if (!approved) return;

        await updateStatus(card, "cancelled");
        showMessage(
          "Rezervasyon iptal edildi.",
          "success"
        );
      }
    } catch (error) {
      showMessage(
        error.message || "İşlem başarısız.",
        "error"
      );
    } finally {
      button.disabled = false;
    }
  }

  async function login() {
    const input = $("#adminKeyInput");
    const key = input?.value.trim() || "";

    if (!key) {
      showMessage(
        "Yönetici anahtarını gir.",
        "error"
      );
      return;
    }

    const loginButton = $("#adminLoginButton");

    if (loginButton) {
      loginButton.disabled = true;
    }

    try {
      const loginResult =
        await loginRequest(key);

      state.adminToken = loginResult.token;

      sessionStorage.setItem(
        "asel_admin_token",
        state.adminToken
      );

      if (input) {
        input.value = "";
      }

      await Promise.all([
        loadReferenceData(),
        loadDashboard()
      ]);

      await loadBookings();

      $("#adminLogin")?.setAttribute(
        "hidden",
        ""
      );

      $("#adminPanel")?.removeAttribute(
        "hidden"
      );

      startAutoRefresh();

      showMessage(
        "Yönetici paneli açıldı.",
        "success"
      );
    } catch (error) {
      state.adminToken = "";

      sessionStorage.removeItem(
        "asel_admin_token"
      );

      showMessage(
        error.message || "Giriş başarısız.",
        "error"
      );
    } finally {
      if (loginButton) {
        loginButton.disabled = false;
      }
    }
  }

  function logout() {
    stopAutoRefresh();

    state.adminToken = "";
    state.bookings = [];
    state.dashboard = null;

    sessionStorage.removeItem(
      "asel_admin_token"
    );

    $("#adminPanel")?.setAttribute(
      "hidden",
      ""
    );

    $("#adminLogin")?.removeAttribute(
      "hidden"
    );

    const input = $("#adminKeyInput");

    if (input) {
      input.value = "";
    }

    clearMessage();
  }

  function bindEvents() {
    $("#adminLoginButton")?.addEventListener(
      "click",
      login
    );

    $("#adminLogoutButton")?.addEventListener(
      "click",
      logout
    );

    $("#refreshDashboard")?.addEventListener(
      "click",
      async () => {
        try {
          await loadDashboard();

          showMessage(
            "Dashboard güncellendi.",
            "success"
          );
        } catch (error) {
          showMessage(
            error.message || "Dashboard güncellenemedi.",
            "error"
          );
        }
      }
    );

    $("#showTodayOnly")?.addEventListener(
      "click",
      async () => {
        const today = state.dashboard?.date || "";

        if ($("#dateFilter")) {
          $("#dateFilter").value = today;
        }

        if ($("#statusFilter")) {
          $("#statusFilter").value = "all";
        }

        await loadBookings();
      }
    );

    $("#refreshBookings")?.addEventListener(
      "click",
      loadBookings
    );

    $("#applyFilters")?.addEventListener(
      "click",
      loadBookings
    );

    $("#clearFilters")?.addEventListener(
      "click",
      () => {
        if ($("#statusFilter")) {
          $("#statusFilter").value = "all";
        }

        if ($("#dateFilter")) {
          $("#dateFilter").value = "";
        }

        if ($("#searchFilter")) {
          $("#searchFilter").value = "";
        }

        loadBookings();
      }
    );

    $("#upcomingTransferList")?.addEventListener(
      "click",
      handleOperationAction
    );

    $("#quickAssignSubmit")?.addEventListener(
      "click",
      async () => {
        const button = $("#quickAssignSubmit");

        if (button) button.disabled = true;

        try {
          await submitQuickAssign();
        } catch (error) {
          showMessage(
            error.message || "Atama başarısız.",
            "error"
          );
        } finally {
          if (button) button.disabled = false;
        }
      }
    );

    document
      .querySelectorAll("[data-close-detail-modal]")
      .forEach((element) => {
        element.addEventListener(
          "click",
          closeBookingDetailModal
        );
      });

    document
      .querySelectorAll("[data-close-assign-modal]")
      .forEach((element) => {
        element.addEventListener(
          "click",
          closeQuickAssignModal
        );
      });

    $("#autoRefreshToggle")?.addEventListener(
      "change",
      () => {
        if ($("#autoRefreshToggle")?.checked) {
          startAutoRefresh();

          showMessage(
            "Otomatik yenileme açıldı.",
            "success"
          );
        } else {
          stopAutoRefresh();

          showMessage(
            "Otomatik yenileme kapatıldı.",
            "info"
          );
        }
      }
    );

    $("#todayBookingList")?.addEventListener(
      "click",
      handleTodayBookingAction
    );

    $("#bookingList")?.addEventListener(
      "click",
      handleBookingAction
    );
  }

  async function restoreSession() {
    if (!state.adminToken) return;

    try {
      await apiRequest(
        "/api/admin/session"
      );

      await Promise.all([
        loadReferenceData(),
        loadDashboard()
      ]);

      await loadBookings();

      $("#adminLogin")?.setAttribute(
        "hidden",
        ""
      );

      $("#adminPanel")?.removeAttribute(
        "hidden"
      );

      startAutoRefresh();
    } catch {
      logout();

      showMessage(
        "Yönetici oturumunun süresi dolmuş. Yeniden giriş yap.",
        "info"
      );
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    async () => {
      bindEvents();
      await restoreSession();
    }
  );
})();
