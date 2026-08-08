/*
 * Asel VIP Tur — Cloudflare Worker API
 *
 * Gereken binding ve secret:
 *
 * D1 Binding:
 *   DB -> aselviptur-production
 *
 * Worker Secret:
 *   ADMIN_API_KEY
 */

const STATUS_LABELS = Object.freeze({
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  driver_assigned: "Şoföre Atandı",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi"
});

const ALLOWED_STATUSES = new Set(
  Object.keys(STATUS_LABELS)
);

const ALLOWED_ORIGINS = new Set([
  "https://aselviptur.com",
  "https://www.aselviptur.com"
]);

const MAX_ADMIN_RESULTS = 250;


/* --------------------------------------------------
 * Genel yardımcılar
 * -------------------------------------------------- */

function clean(value, maxLength = 250) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}


function normalizeNullable(value, maxLength = 250) {
  const result = clean(value, maxLength);
  return result || null;
}


function normalizePhone(value) {
  return clean(value, 30);
}


function extractPhoneLastFour(phone) {
  const digits = String(phone ?? "")
    .replace(/\D/g, "");

  return digits.slice(-4);
}


function parsePositiveInteger(value, fallback = null) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return fallback;
  }

  return number;
}


function parseNullablePrice(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}


async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}


function getAllowedOrigin(request) {
  const origin = request.headers.get("Origin") || "";

  if (!origin) {
    return null;
  }

  return ALLOWED_ORIGINS.has(origin)
    ? origin
    : null;
}


function isOriginAllowed(request) {
  const origin = request.headers.get("Origin") || "";

  return !origin || ALLOWED_ORIGINS.has(origin);
}


function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Resource-Policy": "same-site"
  };
}


function corsHeaders(request) {
  const headers = {
    "Access-Control-Allow-Methods":
      "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, X-Admin-Key, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };

  const allowedOrigin = getAllowedOrigin(request);

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] =
      allowedOrigin;
  }

  return headers;
}


function json(request, body, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
        ...securityHeaders(),
        ...corsHeaders(request)
      }
    }
  );
}


function validateJsonRequest(
  request,
  maxBytes = 20_000
) {
  const contentType =
    request.headers.get("Content-Type") || "";

  if (
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return {
      status: 415,
      error:
        "Content-Type application/json olmalıdır."
    };
  }

  const contentLength = Number(
    request.headers.get("Content-Length") || 0
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > maxBytes
  ) {
    return {
      status: 413,
      error:
        "Gönderilen veri izin verilen boyutu aşıyor."
    };
  }

  return null;
}


function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}


function createBookingCode() {
  const year = String(
    new Date().getUTCFullYear()
  ).slice(-2);

  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);

  const randomPart = Array
    .from(bytes)
    .map((value) =>
      value
        .toString(36)
        .padStart(2, "0")
    )
    .join("")
    .toUpperCase();

  return `ASEL-${year}-${randomPart}`;
}



function base64UrlEncode(value) {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new TextEncoder().encode(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}


function base64UrlDecode(value) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding =
    "=".repeat((4 - normalized.length % 4) % 4);

  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}


async function getJwtSigningKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );
}


async function createAdminToken(env) {
  if (!env.ADMIN_JWT_SECRET) {
    throw new Error(
      "ADMIN_JWT_SECRET yapılandırılmamış."
    );
  }

  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const payload = {
    sub: "asel-admin",
    role: "admin",
    iat: now,
    exp: now + (8 * 60 * 60),
    iss: "aselviptur-api",
    aud: "aselviptur-admin"
  };

  const encodedHeader =
    base64UrlEncode(JSON.stringify(header));

  const encodedPayload =
    base64UrlEncode(JSON.stringify(payload));

  const signingInput =
    `${encodedHeader}.${encodedPayload}`;

  const key = await getJwtSigningKey(
    env.ADMIN_JWT_SECRET
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );

  return (
    `${signingInput}.` +
    base64UrlEncode(new Uint8Array(signature))
  );
}


async function verifyAdminToken(token, env) {
  if (!token || !env.ADMIN_JWT_SECRET) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [
    encodedHeader,
    encodedPayload,
    encodedSignature
  ] = parts;

  try {
    const header = JSON.parse(
      new TextDecoder().decode(
        base64UrlDecode(encodedHeader)
      )
    );

    const payload = JSON.parse(
      new TextDecoder().decode(
        base64UrlDecode(encodedPayload)
      )
    );

    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT"
    ) {
      return null;
    }

    const signingInput =
      `${encodedHeader}.${encodedPayload}`;

    const key = await getJwtSigningKey(
      env.ADMIN_JWT_SECRET
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(signingInput)
    );

    if (!valid) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      payload.exp <= now ||
      payload.iss !== "aselviptur-api" ||
      payload.aud !== "aselviptur-admin" ||
      payload.role !== "admin"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}


function getBearerToken(request) {
  const authorization =
    request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
}


async function requireAdmin(request, env) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    const session = await verifyAdminToken(
      bearerToken,
      env
    );

    if (session) {
      return null;
    }
  }

  /*
   * Geçiş dönemi uyumluluğu:
   * Frontend JWT sistemine geçirilene kadar
   * mevcut X-Admin-Key yöntemi çalışmaya devam eder.
   */
  const providedKey =
    request.headers.get("X-Admin-Key") || "";

  if (
    env.ADMIN_API_KEY &&
    providedKey === env.ADMIN_API_KEY
  ) {
    return null;
  }

  return json(
    request,
    {
      success: false,
      error:
        "Yönetici oturumu geçersiz veya süresi dolmuş."
    },
    401
  );
}


async function loginAdmin(request, env) {
  const requestError =
    validateJsonRequest(request, 4_000);

  if (requestError) {
    return json(
      request,
      {
        success: false,
        error: requestError.error
      },
      requestError.status
    );
  }

  const data = await readJson(request);

  if (!data || typeof data !== "object") {
    return json(
      request,
      {
        success: false,
        error: "Geçerli giriş verisi gönderilmedi."
      },
      400
    );
  }

  const providedKey = clean(
    data.admin_key,
    500
  );

  if (
    !env.ADMIN_API_KEY ||
    providedKey !== env.ADMIN_API_KEY
  ) {
    return json(
      request,
      {
        success: false,
        error: "Yönetici anahtarı geçersiz."
      },
      401
    );
  }

  if (!env.ADMIN_JWT_SECRET) {
    console.error(
      "ADMIN_JWT_SECRET tanımlanmamış."
    );

    return json(
      request,
      {
        success: false,
        error:
          "Yönetici oturum sistemi yapılandırılmamış."
      },
      500
    );
  }

  const token = await createAdminToken(env);

  return json(
    request,
    {
      success: true,
      token,
      token_type: "Bearer",
      expires_in: 8 * 60 * 60
    }
  );
}


async function getAdminSession(request, env) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  return json(
    request,
    {
      success: true,
      authenticated: true
    }
  );
}



/* --------------------------------------------------
 * Validasyon
 * -------------------------------------------------- */

function validateBooking(data) {
  if (!data || typeof data !== "object") {
    return "Geçerli rezervasyon verisi gönderilmedi.";
  }

  const requiredFields = [
    ["customer_name", "Ad soyad"],
    ["customer_phone", "Telefon"],
    ["pickup_location", "Alış noktası"],
    ["dropoff_location", "Bırakış noktası"],
    ["pickup_date", "Tarih"],
    ["pickup_time", "Saat"]
  ];

  for (const [key, label] of requiredFields) {
    if (!clean(data[key])) {
      return `${label} alanı zorunludur.`;
    }
  }

  const phone = normalizePhone(
    data.customer_phone
  );

  if (!/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
    return "Geçerli bir telefon numarası girin.";
  }

  const passengerCount = Number(
    data.passenger_count || 1
  );

  if (
    !Number.isInteger(passengerCount) ||
    passengerCount < 1 ||
    passengerCount > 30
  ) {
    return (
      "Yolcu sayısı 1 ile 30 arasında olmalıdır."
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      clean(data.pickup_date, 10)
    )
  ) {
    return "Geçerli bir tarih girin.";
  }

  if (
    !/^\d{2}:\d{2}$/.test(
      clean(data.pickup_time, 5)
    )
  ) {
    return "Geçerli bir saat girin.";
  }

  const email = clean(
    data.customer_email,
    160
  );

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return "Geçerli bir e-posta adresi girin.";
  }

  return null;
}


/* --------------------------------------------------
 * Sağlık kontrolü
 * -------------------------------------------------- */

async function health(request, env) {
  const result = await env.DB
    .prepare(
      "SELECT COUNT(*) AS total FROM bookings"
    )
    .first();

  return json(request, {
    success: true,
    service: "aselviptur-api",
    database: "connected",
    bookings: Number(result?.total || 0)
  });
}


/* --------------------------------------------------
 * Müşteri rezervasyon API
 * -------------------------------------------------- */

async function createBooking(request, env) {
  const requestError =
    validateJsonRequest(request);

  if (requestError) {
    return json(
      request,
      {
        success: false,
        error: requestError.error
      },
      requestError.status
    );
  }

  const data = await readJson(request);

  const validationError =
    validateBooking(data);

  if (validationError) {
    return json(
      request,
      {
        success: false,
        error: validationError
      },
      400
    );
  }

  const customerPhone = normalizePhone(
    data.customer_phone
  );

  const phoneLastFour =
    extractPhoneLastFour(customerPhone);

  if (!/^\d{4}$/.test(phoneLastFour)) {
    return json(
      request,
      {
        success: false,
        error:
          "Telefon numarasının son dört hanesi alınamadı."
      },
      400
    );
  }

  const passengerCount = Number(
    data.passenger_count || 1
  );

  const estimatedPrice =
    parseNullablePrice(data.estimated_price);

  const sql = `
    INSERT INTO bookings (
      booking_code,
      status,
      customer_name,
      customer_email,
      customer_phone,
      phone_last_four,
      pickup_location,
      dropoff_location,
      pickup_date,
      pickup_time,
      flight_number,
      passenger_count,
      vehicle_type,
      trip_type,
      estimated_price,
      currency,
      customer_note,
      created_at,
      updated_at
    )
    VALUES (
      ?1, ?2, ?3, ?4, ?5,
      ?6, ?7, ?8, ?9, ?10,
      ?11, ?12, ?13, ?14, ?15,
      ?16, ?17,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    const bookingCode =
      createBookingCode();

    try {
      const result = await env.DB
        .prepare(sql)
        .bind(
          bookingCode,
          "pending",
          clean(data.customer_name, 120),
          normalizeNullable(
            data.customer_email,
            160
          ),
          customerPhone,
          phoneLastFour,
          clean(data.pickup_location, 180),
          clean(data.dropoff_location, 180),
          clean(data.pickup_date, 10),
          clean(data.pickup_time, 5),
          normalizeNullable(
            data.flight_number,
            30
          ),
          passengerCount,
          clean(
            data.vehicle_type || "vito",
            30
          ),
          clean(
            data.trip_type || "one",
            20
          ),
          estimatedPrice,
          clean(
            data.currency || "EUR",
            10
          ),
          normalizeNullable(
            data.customer_note,
            1000
          )
        )
        .run();

      const bookingId = Number(
        result.meta?.last_row_id || 0
      );

      if (bookingId > 0) {
        await env.DB
          .prepare(`
            INSERT INTO booking_events (
              booking_id,
              event_type,
              old_status,
              new_status,
              note
            )
            VALUES (?1, ?2, ?3, ?4, ?5)
          `)
          .bind(
            bookingId,
            "booking_created",
            null,
            "pending",
            "Rezervasyon müşteri tarafından oluşturuldu."
          )
          .run();
      }

      return json(
        request,
        {
          success: true,
          id: bookingId,
          booking_code: bookingCode,
          status: "pending",
          status_label:
            STATUS_LABELS.pending
        },
        201
      );

    } catch (error) {
      const message = String(
        error?.message || error
      );

      if (
        !message
          .toLowerCase()
          .includes("unique")
      ) {
        throw error;
      }
    }
  }

  return json(
    request,
    {
      success: false,
      error:
        "Rezervasyon kodu üretilemedi. Tekrar deneyin."
    },
    500
  );
}


async function trackBooking(
  request,
  env,
  bookingCode
) {
  const url = new URL(request.url);

  const phoneLastFour = clean(
    url.searchParams.get("phone_last_four"),
    4
  );

  if (!/^\d{4}$/.test(phoneLastFour)) {
    return json(
      request,
      {
        success: false,
        error:
          "Telefon numarasının son dört hanesini girin."
      },
      400
    );
  }

  const booking = await env.DB
    .prepare(`
      SELECT
        b.booking_code,
        b.status,
        b.pickup_location,
        b.dropoff_location,
        b.pickup_date,
        b.pickup_time
      FROM bookings b
      WHERE
        upper(b.booking_code) = upper(?1)
        AND b.phone_last_four = ?2
      LIMIT 1
    `)
    .bind(
      clean(bookingCode, 50),
      phoneLastFour
    )
    .first();

  if (!booking) {
    return json(
      request,
      {
        success: false,
        error:
          "Rezervasyon bulunamadı veya doğrulama bilgisi yanlış."
      },
      404
    );
  }

  return json(request, {
    success: true,
    booking_code: booking.booking_code,
    status: booking.status,
    status_label:
      statusLabel(booking.status),
    pickup_location:
      booking.pickup_location,
    dropoff_location:
      booking.dropoff_location,
    pickup_date: booking.pickup_date,
    pickup_time: booking.pickup_time
  });
}


/* --------------------------------------------------
 * Yönetici rezervasyon API
 * -------------------------------------------------- */

async function listAdminBookings(
  request,
  env
) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const url = new URL(request.url);

  const requestedStatus = clean(
    url.searchParams.get("status"),
    30
  );

  const requestedDate = clean(
    url.searchParams.get("date"),
    10
  );

  const requestedSearch = clean(
    url.searchParams.get("search"),
    100
  );

  const conditions = [];
  const bindings = [];

  if (
    requestedStatus &&
    requestedStatus !== "all"
  ) {
    conditions.push(
      `b.status = ?${bindings.length + 1}`
    );

    bindings.push(requestedStatus);
  }

  if (requestedDate) {
    conditions.push(
      `b.pickup_date = ?${bindings.length + 1}`
    );

    bindings.push(requestedDate);
  }

  if (requestedSearch) {
    const parameter =
      `?${bindings.length + 1}`;

    conditions.push(`
      (
        b.booking_code LIKE ${parameter}
        OR b.customer_name LIKE ${parameter}
        OR b.customer_phone LIKE ${parameter}
        OR b.pickup_location LIKE ${parameter}
        OR b.dropoff_location LIKE ${parameter}
        OR COALESCE(
          b.flight_number,
          ''
        ) LIKE ${parameter}
      )
    `);

    bindings.push(
      `%${requestedSearch}%`
    );
  }

  const whereSql = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const statement = env.DB.prepare(`
    SELECT
      b.id,
      b.booking_code,
      b.status,

      b.customer_name,
      b.customer_email,
      b.customer_phone,

      b.pickup_location,
      b.dropoff_location,
      b.pickup_date,
      b.pickup_time,

      b.flight_number,
      b.passenger_count,
      b.vehicle_type,
      b.trip_type,

      b.estimated_price,
      b.currency,

      b.customer_note,
      b.admin_note,

      b.assigned_driver_id,
      b.assigned_vehicle_id,

      b.created_at,
      b.updated_at,

      d.full_name AS driver_name,
      d.phone AS driver_phone,

      v.label AS vehicle_label,
      v.plate AS vehicle_plate

    FROM bookings b

    LEFT JOIN drivers d
      ON d.id = b.assigned_driver_id

    LEFT JOIN vehicles v
      ON v.id = b.assigned_vehicle_id

    ${whereSql}

    ORDER BY
      CASE
        WHEN b.status = 'pending'
          THEN 0
        WHEN b.status = 'driver_assigned'
          THEN 1
        WHEN b.status = 'confirmed'
          THEN 2
        WHEN b.status = 'completed'
          THEN 3
        ELSE 4
      END,
      b.pickup_date ASC,
      b.pickup_time ASC,
      b.id DESC

    LIMIT ${MAX_ADMIN_RESULTS}
  `);

  const result = bindings.length
    ? await statement
        .bind(...bindings)
        .all()
    : await statement.all();

  const bookings = (
    result.results || []
  ).map((booking) => ({
    ...booking,
    status_label:
      statusLabel(booking.status)
  }));

  return json(request, {
    success: true,
    count: bookings.length,
    bookings
  });
}


async function updateBookingStatus(
  request,
  env,
  bookingId
) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const id = parsePositiveInteger(
    bookingId
  );

  if (!id) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçersiz rezervasyon kimliği."
      },
      400
    );
  }

  const requestError =
    validateJsonRequest(request);

  if (requestError) {
    return json(
      request,
      {
        success: false,
        error: requestError.error
      },
      requestError.status
    );
  }

  const data = await readJson(request);

  if (!data) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçerli JSON verisi gönderilmelidir."
      },
      400
    );
  }

  const newStatus = clean(
    data.status,
    30
  );

  if (!ALLOWED_STATUSES.has(newStatus)) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçersiz rezervasyon durumu."
      },
      400
    );
  }

  const booking = await env.DB
    .prepare(`
      SELECT id, status
      FROM bookings
      WHERE id = ?1
      LIMIT 1
    `)
    .bind(id)
    .first();

  if (!booking) {
    return json(
      request,
      {
        success: false,
        error:
          "Rezervasyon bulunamadı."
      },
      404
    );
  }

  const adminNote = normalizeNullable(
    data.admin_note,
    1000
  );

  await env.DB
    .prepare(`
      UPDATE bookings
      SET
        status = ?1,
        admin_note =
          COALESCE(?2, admin_note),
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?3
    `)
    .bind(
      newStatus,
      adminNote,
      id
    )
    .run();

  await env.DB
    .prepare(`
      INSERT INTO booking_events (
        booking_id,
        event_type,
        old_status,
        new_status,
        note
      )
      VALUES (?1, ?2, ?3, ?4, ?5)
    `)
    .bind(
      id,
      "status_changed",
      booking.status,
      newStatus,
      adminNote
    )
    .run();

  return json(request, {
    success: true,
    id,
    status: newStatus,
    status_label:
      statusLabel(newStatus)
  });
}


/* --------------------------------------------------
 * Şoför ve araç API
 * -------------------------------------------------- */


async function exportAxiomSnapshot(
  request,
  env
) {
  const providedKey =
    request.headers.get(
      "X-Axiom-Integration-Key"
    ) || "";

  if (
    !env.AXIOM_INTEGRATION_KEY ||
    providedKey !==
      env.AXIOM_INTEGRATION_KEY
  ) {
    return json(
      request,
      {
        success: false,
        error:
          "Integration yetkisi geçersiz."
      },
      401
    );
  }

  const drivers = await env.DB
    .prepare(`
      SELECT *
      FROM drivers
      ORDER BY id ASC
    `)
    .all();

  const vehicles = await env.DB
    .prepare(`
      SELECT *
      FROM vehicles
      ORDER BY id ASC
    `)
    .all();

  const bookings = await env.DB
    .prepare(`
      SELECT *
      FROM bookings
      ORDER BY id ASC
    `)
    .all();

  return json(
    request,
    {
      success: true,

      source:
        "aselviptur.com",

      schema_version:
        1,

      generated_at:
        new Date().toISOString(),

      drivers:
        drivers.results || [],

      vehicles:
        vehicles.results || [],

      bookings:
        bookings.results || []
    }
  );
}


async function listDrivers(request, env) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const result = await env.DB
    .prepare(`
      SELECT
        id,
        full_name,
        phone,
        email,
        active
      FROM drivers
      WHERE active = 1
      ORDER BY full_name ASC
    `)
    .all();

  return json(request, {
    success: true,
    drivers: result.results || []
  });
}


async function listVehicles(request, env) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const result = await env.DB
    .prepare(`
      SELECT
        id,
        plate,
        label,
        capacity,
        status
      FROM vehicles
      WHERE status != 'inactive'
      ORDER BY label ASC
    `)
    .all();

  return json(request, {
    success: true,
    vehicles: result.results || []
  });
}


async function assignBooking(
  request,
  env,
  bookingId
) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const id = parsePositiveInteger(
    bookingId
  );

  if (!id) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçersiz rezervasyon kimliği."
      },
      400
    );
  }

  const requestError =
    validateJsonRequest(request);

  if (requestError) {
    return json(
      request,
      {
        success: false,
        error: requestError.error
      },
      requestError.status
    );
  }

  const data = await readJson(request);

  if (!data) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçerli JSON verisi gönderilmelidir."
      },
      400
    );
  }

  const driverId = parsePositiveInteger(
    data.driver_id
  );

  const vehicleId = data.vehicle_id
    ? parsePositiveInteger(
        data.vehicle_id
      )
    : null;

  if (!driverId) {
    return json(
      request,
      {
        success: false,
        error:
          "Geçerli bir şoför seçin."
      },
      400
    );
  }

  const driver = await env.DB
    .prepare(`
      SELECT
        id,
        full_name,
        phone
      FROM drivers
      WHERE
        id = ?1
        AND active = 1
      LIMIT 1
    `)
    .bind(driverId)
    .first();

  if (!driver) {
    return json(
      request,
      {
        success: false,
        error:
          "Şoför bulunamadı veya aktif değil."
      },
      404
    );
  }

  let vehicle = null;

  if (vehicleId) {
    vehicle = await env.DB
      .prepare(`
        SELECT
          id,
          label,
          plate
        FROM vehicles
        WHERE id = ?1
        LIMIT 1
      `)
      .bind(vehicleId)
      .first();

    if (!vehicle) {
      return json(
        request,
        {
          success: false,
          error:
            "Araç bulunamadı."
        },
        404
      );
    }
  }

  const booking = await env.DB
    .prepare(`
      SELECT *
      FROM bookings
      WHERE id = ?1
      LIMIT 1
    `)
    .bind(id)
    .first();

  if (!booking) {
    return json(
      request,
      {
        success: false,
        error:
          "Rezervasyon bulunamadı."
      },
      404
    );
  }

  await env.DB
    .prepare(`
      UPDATE bookings
      SET
        assigned_driver_id = ?1,
        assigned_vehicle_id = ?2,
        status = 'driver_assigned',
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?3
    `)
    .bind(
      driverId,
      vehicleId,
      id
    )
    .run();

  await env.DB
    .prepare(`
      INSERT INTO booking_events (
        booking_id,
        event_type,
        old_status,
        new_status,
        note
      )
      VALUES (?1, ?2, ?3, ?4, ?5)
    `)
    .bind(
      id,
      "driver_assigned",
      booking.status,
      "driver_assigned",
      `${driver.full_name} adlı şoföre atandı.`
    )
    .run();

  const whatsappMessage = [
    "Yeni Transfer Görevi",
    "",
    `Rezervasyon: ${booking.booking_code}`,
    `Müşteri: ${booking.customer_name}`,
    `Telefon: ${booking.customer_phone}`,
    `Tarih: ${booking.pickup_date}`,
    `Saat: ${booking.pickup_time}`,
    `Alış: ${booking.pickup_location}`,
    `Varış: ${booking.dropoff_location}`,
    `Yolcu: ${booking.passenger_count}`,
    `Uçuş: ${booking.flight_number || "-"}`,
    `Araç: ${
      vehicle
        ? `${vehicle.label} (${vehicle.plate})`
        : booking.vehicle_type
    }`,
    `Not: ${booking.customer_note || "-"}`
  ].join("\n");

  const driverPhone = String(
    driver.phone || ""
  ).replace(/\D/g, "");

  const whatsappUrl = driverPhone
    ? (
      `https://wa.me/${driverPhone}` +
      `?text=${encodeURIComponent(
        whatsappMessage
      )}`
    )
    : null;

  return json(request, {
    success: true,
    booking_id: id,
    status: "driver_assigned",
    status_label:
      STATUS_LABELS.driver_assigned,
    driver: {
      id: driver.id,
      full_name: driver.full_name,
      phone: driver.phone
    },
    vehicle: vehicle
      ? {
          id: vehicle.id,
          label: vehicle.label,
          plate: vehicle.plate
        }
      : null,
    whatsapp_message:
      whatsappMessage,
    whatsapp_url:
      whatsappUrl
  });
}



/* --------------------------------------------------
 * Operasyon Dashboard API
 * -------------------------------------------------- */

function getIstanbulDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(new Date());
}


async function getAdminDashboard(request, env) {
  const authError = await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const today = getIstanbulDate();

  const [
    bookingStats,
    driverStats,
    vehicleStats,
    todayResult,
    pendingResult
  ] = await Promise.all([
    env.DB
      .prepare(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1 ELSE 0
            END
          ) AS pending,

          SUM(
            CASE
              WHEN status = 'confirmed'
              THEN 1 ELSE 0
            END
          ) AS confirmed,

          SUM(
            CASE
              WHEN status = 'driver_assigned'
              THEN 1 ELSE 0
            END
          ) AS driver_assigned,

          SUM(
            CASE
              WHEN status = 'completed'
              THEN 1 ELSE 0
            END
          ) AS completed,

          SUM(
            CASE
              WHEN status = 'cancelled'
              THEN 1 ELSE 0
            END
          ) AS cancelled,

          SUM(
            CASE
              WHEN pickup_date = ?1
              THEN 1 ELSE 0
            END
          ) AS today,

          SUM(
            CASE
              WHEN pickup_date = ?1
                AND status = 'pending'
              THEN 1 ELSE 0
            END
          ) AS today_unassigned,

          COALESCE(
            SUM(
              CASE
                WHEN pickup_date = ?1
                  AND status != 'cancelled'
                THEN passenger_count
                ELSE 0
              END
            ),
            0
          ) AS today_passengers,

          COALESCE(
            SUM(
              CASE
                WHEN pickup_date = ?1
                  AND status != 'cancelled'
                THEN estimated_price
                ELSE 0
              END
            ),
            0
          ) AS today_revenue

        FROM bookings
      `)
      .bind(today)
      .first(),

    env.DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM drivers
        WHERE active = 1
      `)
      .first(),

    env.DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM vehicles
        WHERE status != 'inactive'
      `)
      .first(),

    env.DB
      .prepare(`
        SELECT
          b.id,
          b.booking_code,
          b.status,

          b.customer_name,
          b.customer_phone,
          b.customer_email,

          b.pickup_location,
          b.dropoff_location,
          b.pickup_date,
          b.pickup_time,

          b.flight_number,
          b.passenger_count,
          b.vehicle_type,

          b.estimated_price,
          b.currency,

          b.customer_note,
          b.admin_note,
          b.created_at,

          b.assigned_driver_id,
          b.assigned_vehicle_id,

          d.full_name AS driver_name,
          d.phone AS driver_phone,

          v.label AS vehicle_label,
          v.plate AS vehicle_plate

        FROM bookings b

        LEFT JOIN drivers d
          ON d.id = b.assigned_driver_id

        LEFT JOIN vehicles v
          ON v.id = b.assigned_vehicle_id

        WHERE
          b.pickup_date = ?1
          AND b.status != 'cancelled'

        ORDER BY
          b.pickup_time ASC,
          b.id ASC

        LIMIT 150
      `)
      .bind(today)
      .all(),

    env.DB
      .prepare(`
        SELECT
          b.id,
          b.booking_code,
          b.status,

          b.customer_name,
          b.customer_phone,
          b.customer_email,

          b.pickup_location,
          b.dropoff_location,
          b.pickup_date,
          b.pickup_time,

          b.flight_number,
          b.passenger_count,
          b.vehicle_type,

          b.estimated_price,
          b.currency,

          b.customer_note,
          b.admin_note,
          b.created_at,

          b.assigned_driver_id,
          b.assigned_vehicle_id,

          d.full_name AS driver_name,
          d.phone AS driver_phone,

          v.label AS vehicle_label,
          v.plate AS vehicle_plate

        FROM bookings b

        LEFT JOIN drivers d
          ON d.id = b.assigned_driver_id

        LEFT JOIN vehicles v
          ON v.id = b.assigned_vehicle_id

        WHERE b.status = 'pending'

        ORDER BY
          b.pickup_date ASC,
          b.pickup_time ASC,
          b.id ASC

        LIMIT 150
      `)
      .all()
  ]);

  const todayBookings = (
    todayResult.results || []
  ).map((booking) => ({
    ...booking,
    status_label:
      statusLabel(booking.status)
  }));

  const pendingBookings = (
    pendingResult.results || []
  ).map((booking) => ({
    ...booking,
    status_label:
      statusLabel(booking.status)
  }));

  return json(request, {
    success: true,
    date: today,

    stats: {
      total:
        Number(bookingStats?.total || 0),

      pending:
        Number(bookingStats?.pending || 0),

      confirmed:
        Number(bookingStats?.confirmed || 0),

      driver_assigned:
        Number(
          bookingStats?.driver_assigned || 0
        ),

      completed:
        Number(bookingStats?.completed || 0),

      cancelled:
        Number(bookingStats?.cancelled || 0),

      today:
        Number(bookingStats?.today || 0),

      today_unassigned:
        Number(
          bookingStats?.today_unassigned || 0
        ),

      today_passengers:
        Number(
          bookingStats?.today_passengers || 0
        ),

      today_revenue:
        Number(
          bookingStats?.today_revenue || 0
        ),

      active_drivers:
        Number(driverStats?.total || 0),

      active_vehicles:
        Number(vehicleStats?.total || 0)
    },

    today_bookings: todayBookings,
    pending_bookings: pendingBookings
  });
}


async function deleteAdminBooking(
  request,
  env,
  bookingId
) {
  const authError =
    await requireAdmin(request, env);

  if (authError) {
    return authError;
  }

  const id = Number(bookingId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return json(
      request,
      {
        success: false,
        error: "Geçersiz rezervasyon kimliği."
      },
      400
    );
  }

  const booking = await env.DB
    .prepare(`
      SELECT
        id,
        booking_code,
        status
      FROM bookings
      WHERE id = ?1
      LIMIT 1
    `)
    .bind(id)
    .first();

  if (!booking) {
    return json(
      request,
      {
        success: false,
        error: "Rezervasyon bulunamadı."
      },
      404
    );
  }

  if (
    booking.status !== "completed" &&
    booking.status !== "cancelled"
  ) {
    return json(
      request,
      {
        success: false,
        error:
          "Yalnızca tamamlanmış veya iptal edilmiş rezervasyonlar silinebilir."
      },
      409
    );
  }

  const eventTable = await env.DB
    .prepare(`
      SELECT name
      FROM sqlite_master
      WHERE
        type = 'table'
        AND name = 'booking_events'
      LIMIT 1
    `)
    .first();

  const statements = [];

  if (eventTable) {
    statements.push(
      env.DB
        .prepare(`
          DELETE FROM booking_events
          WHERE booking_id = ?1
        `)
        .bind(id)
    );
  }

  statements.push(
    env.DB
      .prepare(`
        DELETE FROM bookings
        WHERE id = ?1
      `)
      .bind(id)
  );

  await env.DB.batch(statements);

  return json(
    request,
    {
      success: true,
      deleted_id: id,
      booking_code: booking.booking_code
    }
  );
}


/* --------------------------------------------------
 * Router
 * -------------------------------------------------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      if (!isOriginAllowed(request)) {
        return json(
          request,
          {
            success: false,
            error: "Origin erişimine izin verilmedi."
          },
          403
        );
      }

      return new Response(null, {
        status: 204,
        headers: {
          ...securityHeaders(),
          ...corsHeaders(request)
        }
      });
    }

    try {
      if (!isOriginAllowed(request)) {
        return json(
          request,
          {
            success: false,
            error: "Origin erişimine izin verilmedi."
          },
          403
        );
      }

      if (
        request.method === "GET" &&
        (
          pathname === "/" ||
          pathname === "/health" ||
          pathname === "/api/health"
        )
      ) {
        return health(request, env);
      }

      if (
        request.method === "POST" &&
        (
          pathname === "/booking" ||
          pathname === "/api/bookings"
        )
      ) {
        return createBooking(request, env);
      }

      const trackingMatch = pathname.match(
        /^\/api\/bookings\/([^/]+)$/
      );

      if (
        request.method === "GET" &&
        trackingMatch
      ) {
        return trackBooking(
          request,
          env,
          decodeURIComponent(
            trackingMatch[1]
          )
        );
      }

      if (
        request.method === "POST" &&
        pathname === "/api/admin/login"
      ) {
        return loginAdmin(request, env);
      }

      if (
        request.method === "GET" &&
        pathname === "/api/admin/session"
      ) {
        return getAdminSession(request, env);
      }

      if (
        request.method === "GET" &&
        pathname === "/api/admin/dashboard"
      ) {
        return getAdminDashboard(
          request,
          env
        );
      }

      if (
        request.method === "GET" &&
        pathname === "/api/admin/bookings"
      ) {
        return listAdminBookings(
          request,
          env
        );
      }

      if (
        request.method === "GET" &&
        pathname === "/api/integrations/axiom/snapshot"
      ) {
        return exportAxiomSnapshot(
          request,
          env
        );
      }

      if (
        request.method === "GET" &&
        pathname === "/api/admin/drivers"
      ) {
        return listDrivers(
          request,
          env
        );
      }

      if (
        request.method === "GET" &&
        pathname === "/api/admin/vehicles"
      ) {
        return listVehicles(
          request,
          env
        );
      }

      const deleteMatch = pathname.match(
        /^\/api\/admin\/bookings\/(\d+)$/
      );

      if (
        request.method === "DELETE" &&
        deleteMatch
      ) {
        return deleteAdminBooking(
          request,
          env,
          deleteMatch[1]
        );
      }

      const statusMatch = pathname.match(
        /^\/api\/admin\/bookings\/(\d+)\/status$/
      );

      if (
        request.method === "PATCH" &&
        statusMatch
      ) {
        return updateBookingStatus(
          request,
          env,
          statusMatch[1]
        );
      }

      const assignMatch = pathname.match(
        /^\/api\/admin\/bookings\/(\d+)\/assign$/
      );

      if (
        request.method === "PATCH" &&
        assignMatch
      ) {
        return assignBooking(
          request,
          env,
          assignMatch[1]
        );
      }

      return json(
        request,
        {
          success: false,
          error: "Endpoint bulunamadı."
        },
        404
      );

    } catch (error) {
      console.error(
        "Worker error:",
        error
      );

      return json(
        request,
        {
          success: false,
          error:
            "Beklenmeyen bir sunucu hatası oluştu."
        },
        500
      );
    }
  }
};
