/**
 * GridCore mock API.
 *
 * A stand-in for the Go service so the frontend can be built and its error
 * paths exercised before the backend exists. Zero dependencies — plain Node.
 *
 * Every error it returns follows the contract in architecture/10-api-errors.md
 * (RFC 9457 problem+json), including field-level validation errors, so the
 * inline-error handling in the forms is genuinely tested rather than assumed.
 *
 *   pnpm --filter @gridcore/mock-api dev
 *
 * Data lives in db.json and is re-read on every request, so you can edit it
 * while the server runs.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(DIR, "db.json");
const PORT = Number(process.env.PORT ?? 4000);
const LATENCY_MS = Number(process.env.MOCK_LATENCY ?? 150);

const readDb = async () => JSON.parse(await readFile(DB_PATH, "utf8"));

// ---------------------------------------------------------------- responses

let requestCounter = 0;
const traceId = () =>
  `mock-${Date.now().toString(36)}-${(++requestCounter).toString(36)}`;

function send(res, status, body, headers = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

/** Success envelope the current frontend expects: { data: ... } */
const ok = (res, data, status = 200) => send(res, status, { data });

/** RFC 9457 problem+json — see architecture/10-api-errors.md */
function problem(res, req, { status, code, title, detail, errors }) {
  send(
    res,
    status,
    {
      type: `https://api.gridcore.com/problems/${code}`,
      title,
      status,
      detail,
      instance: req.url.split("?")[0],
      code,
      traceId: traceId(),
      ...(errors?.length ? { errors } : {}),
    },
    { "Content-Type": "application/problem+json" }
  );
}

const validation = (res, req, errors) =>
  problem(res, req, {
    status: 422,
    code: "validation_failed",
    title: "Validation failed",
    detail: "One or more fields need attention.",
    errors,
  });

const unauthorized = (res, req, detail = "Your session has expired.") =>
  problem(res, req, {
    status: 401,
    code: "unauthenticated",
    title: "Not signed in",
    detail,
  });

const notFound = (res, req) =>
  problem(res, req, {
    status: 404,
    code: "not_found",
    title: "Not found",
    detail: `No mock route for ${req.method} ${req.url.split("?")[0]}. Add one in mock-api/server.mjs.`,
  });

// ---------------------------------------------------------------- helpers

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null); // signals malformed JSON
      }
    });
  });

const required = (body, fields) =>
  fields
    .filter((f) => {
      const v = body[f];
      return v === undefined || v === null || String(v).trim() === "";
    })
    .map((field) => ({
      field,
      code: "required",
      message: "This field is required.",
    }));

const paginate = (items, query) => {
  const page = Number(query.get("page") ?? 1);
  const perPage = Number(query.get("perPage") ?? 20);
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    meta: {
      total: items.length,
      page,
      perPage,
      lastPage: Math.max(1, Math.ceil(items.length / perPage)),
    },
  };
};

/** Resolve the caller from the bearer token. Mock tokens are `mock.<userId>.token`. */
const callerOf = (db, auth) => {
  const id = /mock\.([^.]+)\./.exec(auth ?? "")?.[1];
  return db.users.find((u) => u.id === id) ?? null;
};

/**
 * Row-level scoping, decided from the token rather than the URL.
 *
 * This is the contract the Go service must implement: `GET /meters` returns the
 * caller's meters for a merchant and every meter for a platform operator. The
 * frontend calls one endpoint and never asks for "all" — see
 * architecture/07-frontend-unification.md.
 */
const scopeToCaller = (rows, caller) => {
  if (!caller) return [];
  if (caller.accountType === "admin") return rows;
  if (caller.merchantId)
    return rows.filter((r) => r.merchantId === caller.merchantId);
  return rows.filter((r) => r.customerId === caller.id || r.id === caller.id);
};

/** 410 for a URL that used to carry the caller's scope. */
const retired = (res, req, replacement) =>
  problem(res, req, {
    status: 410,
    code: "endpoint_retired",
    title: "Endpoint retired",
    detail: `Scope comes from the token now. Call ${replacement} instead.`,
  });

/**
 * Deliberate failure triggers, so every branch of the frontend's error handling
 * can be reached without editing code. Documented in the README.
 */
function forcedFailure(res, req, value) {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("boom@")) {
    problem(res, req, {
      status: 500,
      code: "internal_error",
      title: "Something went wrong",
      detail: "An unexpected error occurred. Quote the reference when reporting.",
    });
    return true;
  }
  if (v.includes("slow@")) return "slow";
  return false;
}

// ---------------------------------------------------------------- routes

const routes = [
  // ---- website: merchant onboarding -------------------------------------
  {
    method: "GET",
    path: "/general/supported-countries",
    handler: async (_req, res) => {
      const db = await readDb();
      // Nested twice: the frontend reads countriesData.data.data.data
      ok(res, { data: db.supportedCountries });
    },
  },

  {
    method: "POST",
    path: "/auth/merchant-send-otp",
    handler: async (req, res, { body }) => {
      const missing = required(body, ["dialingCode", "phone"]);
      if (missing.length) return validation(res, req, missing);

      if (!/^\d{7,12}$/.test(String(body.phone))) {
        return validation(res, req, [
          {
            field: "phone",
            code: "invalid_format",
            message: "Enter a valid phone number without the country code.",
          },
        ]);
      }

      const db = await readDb();
      ok(res, {
        message: `OTP sent. Use ${db.otp.valid} in this mock environment.`,
      });
    },
  },

  {
    method: "POST",
    path: "/auth/merchant-verify-otp",
    handler: async (req, res, { body }) => {
      const missing = required(body, ["phone", "token"]);
      if (missing.length) return validation(res, req, missing);

      const db = await readDb();

      if (String(body.token) === db.otp.expired) {
        return validation(res, req, [
          {
            field: "token",
            code: "expired",
            message: "That code has expired. Request a new one.",
          },
        ]);
      }

      if (String(body.token) !== db.otp.valid) {
        return validation(res, req, [
          {
            field: "token",
            code: "incorrect",
            message: "That code is not correct. Check your SMS and try again.",
          },
        ]);
      }

      ok(res, { message: "Phone number verified." });
    },
  },

  {
    method: "POST",
    path: "/auth/register-merchant",
    handler: async (req, res, { body }) => {
      const db = await readDb();

      const errors = required(body, [
        "businessName",
        "shortBusinessName",
        "businessWebsite",
        "businessDescription",
        "businessAddress",
        "country",
        "firstName",
        "lastName",
        "email",
        "phone",
      ]);

      // Report EVERY problem at once — see architecture/10-api-errors.md.
      if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
        errors.push({
          field: "email",
          code: "invalid_format",
          message: "Enter a valid email address.",
        });
      } else if (db.takenEmails.includes(String(body.email).toLowerCase())) {
        errors.push({
          field: "email",
          code: "already_registered",
          message: "That email address is already registered.",
        });
      }

      if (db.takenShortNames.includes(String(body.shortBusinessName).toLowerCase())) {
        errors.push({
          field: "shortBusinessName",
          code: "already_taken",
          message: "That short name is taken. Try another.",
        });
      }

      if (body.businessWebsite && !/^https?:\/\/.+\..+/.test(body.businessWebsite)) {
        errors.push({
          field: "businessWebsite",
          code: "invalid_format",
          message: "Enter a full URL, including https://",
        });
      }

      if (body.country && !db.supportedCountries.some((c) => c.code === body.country)) {
        errors.push({
          field: "country",
          code: "unsupported",
          message: "We don't operate in that country yet.",
        });
      }

      if (errors.length) return validation(res, req, errors);

      ok(res, {
        id: `mch_${Date.now()}`,
        message: "Application received. We'll be in touch within 2 business days.",
      });
    },
  },

  {
    method: "POST",
    path: "/uploads/presign",
    handler: async (req, res, { body }) => {
      const missing = required(body, ["fileName", "contentType"]);
      if (missing.length) return validation(res, req, missing);

      // The mock has nowhere to PUT to, so it points back at itself. The
      // frontend's upload flow is exercised end to end; bytes are discarded.
      const key = `${Date.now()}-${body.fileName}`;
      ok(res, {
        uploadUrl: `http://localhost:${PORT}/__mock-upload/${encodeURIComponent(key)}`,
        fileUrl: `http://localhost:${PORT}/__mock-files/${encodeURIComponent(key)}`,
      });
    },
  },

  { method: "PUT", path: /^\/__mock-upload\//, handler: (_req, res) => send(res, 200, { ok: true }) },

  // ---- auth (console + customer) ----------------------------------------
  {
    method: "POST",
    path: /^\/auth\/(admin-)?login$/,
    handler: async (req, res, { body }) => {
      const missing = required(body, ["phone", "password"]);
      if (missing.length) return validation(res, req, missing);

      const db = await readDb();
      const user = db.users.find(
        (u) => u.phone === String(body.phone) || u.email === String(body.phone)
      );

      if (!user || user.password !== body.password) {
        // Deliberately NOT a field error: saying which half was wrong leaks
        // whether an account exists.
        return problem(res, req, {
          status: 401,
          code: "invalid_credentials",
          title: "Sign-in failed",
          detail: "That phone number or password is not correct.",
        });
      }

      const { password, ...safe } = user;
      ok(res, {
        tokens: { accessToken: `mock.${user.id}.token`, refreshToken: "mock.refresh" },
        user: safe,
      });
    },
  },

  {
    method: "GET",
    path: "/users/me",
    handler: async (req, res, { auth }) => {
      if (!auth) return unauthorized(res, req);
      const db = await readDb();
      const user = db.users.find((u) => auth.includes(u.id)) ?? db.users[0];
      const { password, ...safe } = user;
      ok(res, safe);
    },
  },

  {
    method: "GET",
    path: "/merchants/me",
    handler: async (req, res, { auth }) => {
      const db = await readDb();
      const caller = callerOf(db, auth);
      if (!caller) return unauthorized(res, req);

      const merchant = db.merchants.find((m) => m.id === caller.merchantId);
      if (!merchant) return notFound(res, req);
      ok(res, merchant);
    },
  },

  {
    method: "PATCH",
    path: /^\/auth\/change-password$/,
    handler: async (req, res, { body }) => {
      const missing = required(body, ["oldPassword", "newPassword"]);
      if (missing.length) return validation(res, req, missing);

      if (body.oldPassword !== "password123") {
        return validation(res, req, [
          {
            field: "oldPassword",
            code: "incorrect",
            message: "That is not your current password.",
          },
        ]);
      }
      if (String(body.newPassword).length < 8) {
        return validation(res, req, [
          {
            field: "newPassword",
            code: "too_short",
            message: "Use at least 8 characters.",
          },
        ]);
      }
      ok(res, { message: "Password updated." });
    },
  },

  // ---- reference data ----------------------------------------------------
  { method: "GET", path: "/meters/brands", key: "meterBrands" },
  { method: "GET", path: "/meters/types", key: "meterTypes" },
  { method: "GET", path: "/payments/get-banks", key: "banks" },
  { method: "GET", path: "/auth/roles", key: "roles" },
  { method: "GET", path: "/payments/payout-schedules", key: "payoutSchedules" },
  { method: "GET", path: "/payments/payouts-summary", key: "payoutsSummary" },

  /*
   * Analytics is scoped like every other collection. The *shape* differs by
   * caller — a merchant has no platform-wide figures — which is why the
   * console renders its stat cards from the fields present rather than from
   * `isPlatform`.
   */
  {
    method: "GET",
    path: "/analytics/summary",
    handler: async (req, res, { auth }) => {
      const db = await readDb();
      const caller = callerOf(db, auth);
      if (!caller) return unauthorized(res, req);

      const meters = scopeToCaller(db.meters ?? [], caller);
      const customers = scopeToCaller(db.customers ?? [], caller);
      const topups = scopeToCaller(db.topups ?? [], caller);
      const total = topups.reduce((sum, t) => sum + (t.amountMinor ?? 0), 0);

      const summary = {
        totalCustomers: customers.length,
        totalMeters: meters.length,
        totalTopups: topups.length,
        totalTopupAmount: total,
      };

      if (caller.accountType === "admin") {
        summary.totalMerchants = (db.merchants ?? []).length;
        summary.totalCommission = Math.round(total * 0.025);
      }

      return ok(res, summary);
    },
  },
  {
    method: "GET",
    path: "/analytics/topup-per-month",
    handler: async (req, res, { auth, query }) => {
      const db = await readDb();
      const caller = callerOf(db, auth);
      if (!caller) return unauthorized(res, req);

      const year = query.get("year") ?? String(new Date().getFullYear());
      const topups = scopeToCaller(db.topups ?? [], caller);
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const rows = months.map((name, i) => ({
        name,
        topup: topups
          .filter((t) => {
            const d = new Date(t.createdAt ?? 0);
            return String(d.getFullYear()) === year && d.getMonth() === i;
          })
          .reduce((sum, t) => sum + (t.amountMinor ?? 0), 0),
      }));

      return ok(res, { data: rows });
    },
  },

  /*
   * The wallet the caller owns. A platform operator gets the float wallet, a
   * merchant gets theirs — no `isAdminWallet` flag, because the role already
   * says which. `?walletId=` names another wallet and is authorised here.
   */
  {
    method: "GET",
    path: "/wallet/balance",
    handler: async (req, res, { auth, query }) => {
      const db = await readDb();
      const caller = callerOf(db, auth);
      if (!caller) return unauthorized(res, req);

      const walletId = query.get("walletId");
      if (walletId && caller.accountType !== "admin") {
        return problem(res, req, {
          status: 403,
          code: "forbidden",
          title: "Not your wallet",
          detail: "You may only read your own wallet balance.",
        });
      }

      const merchant = walletId
        ? (db.merchants ?? []).find((m) => m.wallet?.id === walletId)
        : (db.merchants ?? []).find((m) => m.id === caller.merchantId);

      return ok(res, {
        balance: merchant?.wallet?.balance ?? 0,
        currency: merchant?.currencyCode ?? "NGN",
      });
    },
  },
  {
    method: "GET",
    path: "/wallet/ledger",
    handler: async (req, res, { auth, query }) => {
      const db = await readDb();
      const caller = callerOf(db, auth);
      if (!caller) return unauthorized(res, req);

      const walletId = query.get("walletId");
      if (walletId && caller.accountType !== "admin") {
        return problem(res, req, {
          status: 403,
          code: "forbidden",
          title: "Not your wallet",
          detail: "You may only read your own wallet ledger.",
        });
      }

      const rows = walletId
        ? (db.transactions ?? []).filter((t) => t.walletId === walletId)
        : scopeToCaller(db.transactions ?? [], caller);

      return ok(res, paginate(rows, query));
    },
  },

  /*
   * Collections are scoped from the bearer token: a merchant sees their own
   * rows, a platform operator sees all. There is deliberately no
   * `/…/merchants/me` variant — the caller never asks for a scope.
   */
  { method: "GET", path: "/merchants", key: "merchants", paginated: true, scoped: true },
  { method: "GET", path: "/users", key: "customers", paginated: true, scoped: true },
  { method: "GET", path: "/meters", key: "meters", paginated: true, scoped: true },
  { method: "GET", path: "/transactions", key: "transactions", paginated: true, scoped: true },
  { method: "GET", path: "/topups", key: "topups", paginated: true, scoped: true },

  /*
   * Every URL that used to encode a scope. They answer 410 rather than 404 so
   * a stale caller gets told why, and so the split cannot quietly come back.
   */
  {
    method: "GET",
    path: /^\/(users|meters|transactions|topups)\/(merchants|merchants-export)(\/me)?$/,
    handler: (req, res) => retired(res, req, "GET /meters"),
  },
  {
    method: "GET",
    path: /^\/analytics\/(admin|merchant)\/(summary|topup-per-month)$/,
    handler: (req, res) => retired(res, req, "GET /analytics/summary"),
  },
  {
    method: "GET",
    path: /^\/transactions\/(admin|merchants)\/wallet-ledger(\/me|\/balance)?$/,
    handler: (req, res) => retired(res, req, "GET /wallet/ledger"),
  },
  {
    method: "POST",
    path: "/auth/me/create-customer-with-meter",
    handler: (req, res) =>
      retired(res, req, "POST /auth/create-customer-with-meter"),
  },
  {
    method: "POST",
    path: "/auth/me/create-merchant-admin",
    handler: (req, res) =>
      retired(res, req, "POST /auth/create-merchant-admin"),
  },
];

// ---------------------------------------------------------------- dispatch

const matches = (route, method, pathname) => {
  if (route.method !== method) return false;
  return route.path instanceof RegExp
    ? route.path.test(pathname)
    : route.path === pathname;
};

const ALLOWED_ORIGINS = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  const body = ["POST", "PUT", "PATCH"].includes(req.method)
    ? await readBody(req)
    : {};

  if (body === null) {
    return problem(res, req, {
      status: 400,
      code: "malformed_request",
      title: "Malformed request",
      detail: "The request body is not valid JSON.",
    });
  }

  // Forced failures for testing, keyed off any email-ish value in the body.
  const trigger = body.email ?? body.emailAddress ?? body.phone;
  const forced = forcedFailure(res, req, trigger);
  if (forced === true) return;
  await new Promise((r) => setTimeout(r, forced === "slow" ? 4000 : LATENCY_MS));

  const route = routes.find((r) => matches(r, req.method, pathname));
  console.log(
    `${req.method} ${pathname}${route ? "" : "  [31m<- no route[0m"}`
  );

  if (!route) return notFound(res, req);

  try {
    if (route.handler) {
      return await route.handler(req, res, {
        body,
        query: url.searchParams,
        auth: req.headers.authorization,
      });
    }

    // Declarative routes: serve a db.json key, optionally scoped and paginated.
    const db = await readDb();
    let value = db[route.key];

    if (route.scoped) {
      const caller = callerOf(db, req.headers.authorization);
      if (!caller) return unauthorized(res, req);
      value = scopeToCaller(value ?? [], caller);
    }

    return route.paginated
      ? ok(res, paginate(value ?? [], url.searchParams))
      : ok(res, value);
  } catch (err) {
    console.error(err);
    return problem(res, req, {
      status: 500,
      code: "internal_error",
      title: "Something went wrong",
      detail: "The mock server threw. See its console output.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`\n  GridCore mock API  →  http://localhost:${PORT}`);
  console.log(`  data: mock-api/db.json (re-read per request)`);
  console.log(`  latency: ${LATENCY_MS}ms  (set MOCK_LATENCY=0 to disable)\n`);
  console.log(`  sign in with  merchant@gridcore.com / password123`);
  console.log(`  force a 422:  register with  taken@example.com`);
  console.log(`  force a 500:  use any email containing  boom@\n`);
});
