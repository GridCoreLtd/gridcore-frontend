# gridcore-frontend

The unified GridCore / PayGo Dash frontend. Three deployables, **no Node runtime
anywhere** — everything builds to static files behind a CDN.

Design rationale lives in [`architecture/07-frontend-unification.md`](../architecture/07-frontend-unification.md).

```
apps/
  console/     Vite + React Router SPA — platform operators AND merchants, one app, RBAC-gated
  customer/    Vite + React Router SPA — buyer portal
  website/     Astro (static) — public marketing site
packages/
  config/      tsconfig bases, eslint preset, tailwind preset, prettier config
mock-api/      stand-in backend for local dev — see mock-api/README.md
```

The website is ported from `paygodash-website-fe` **branch `version-2.0`** — 7 pages:
`/`, `/about-us`, `/solutions`, `/merchants`, `/contact-us`, `/privacy-policy`,
`/terms-and-conditions`. Only three things hydrate: the header (mobile nav +
login dropdown), the About page partner carousel, and the contact / merchant
signup forms. Everything else is static HTML with no component JavaScript.

## Getting started

```bash
pnpm install
pnpm mock         # the stand-in backend, on :4000 — run this first
pnpm dev          # all three apps, in parallel
pnpm build        # all three
pnpm typecheck
pnpm lint
```

Per app: `pnpm --filter @gridcore/console dev`. Dev ports — customer `3000`,
console `3001`, website `3002`, mock API `4000`.

Copy each app's `.env.example` to `.env.local` (`.env` for the website) first.
They already point at the mock.

### Local URLs (WSL)

The local nginx (same setup as the payroll/auth sites) fronts the dev servers
with host-based routing on port 80:

| URL | App |
| --- | --- |
| `http://gridcore.test.net` | website |
| `http://console.gridcore.test.net` | console (admin + merchant) |
| `http://api.gridcore.test.net` | mock API |
| `http://<merchant>.gridcore.test.net` | customer — wildcard; branding keys off the merchant subdomain |

The site file lives at `/etc/nginx/sites-available/gridcore` (symlinked into
`sites-enabled`). The nginx side is a true wildcard, but the Windows hosts
file can't be, so each merchant subdomain you want to open in the browser
needs its own `127.0.0.1` line in `C:\Windows\System32\drivers\etc\hosts`.

## Error handling

The wire contract is [architecture/10-api-errors.md](../architecture/10-api-errors.md)
— RFC 9457 `problem+json`, with per-field validation errors. The Go service must
implement it; `mock-api/` already does.

**The rule: if a user can fix it by editing an input, it belongs on that input.**
Toasts are for things that aren't about a field — the server is down, the session
expired, a background job failed. Every rejected request used to produce a toast,
which meant "that email is already registered" floated at the top of the screen
instead of appearing under the email box.

`src/utils/api-error.ts` (one copy per app until `packages/api-client` lands):

```ts
const problem = parseApiError(error);           // normalises ANY failure shape
if (applyFieldErrors(problem, setError, FIELDS)) {
  toast.error(toastMessage(problem));           // only when nothing mapped
}
```

- `parseApiError` handles problem+json, the legacy `{message}` shape, HTML error
  pages, and network failures (distinguishing offline from unreachable). It never
  throws — the old handlers read `error.response.data.message` and blew up when
  there was no response at all.
- `applyFieldErrors` returns `true` only when the failure couldn't be attached to
  any field. An error naming a field the form doesn't have goes to
  `root.serverError` rather than being dropped silently, so a backend/frontend
  field-name mismatch is visible.
- `toastMessage` appends the `traceId` on 5xx so support can trace it.

### Where each kind of failure surfaces

There are exactly three places an error can appear, and which one is used is not
a judgement call:

| Failure | Surface | Who handles it |
|---|---|---|
| **Mutation**, server named a field | under that input | the call site, via `applyFieldErrors` |
| **Mutation**, nothing maps to a field (401, 500, offline) | toast, or the form's `root.serverError` on auth screens | the call site |
| **Query** (any read) | toast | one global `QueryCache.onError` in `Providers.tsx` |
| **401 anywhere** | clear session → redirect to login | the axios interceptor |

**The axios interceptors no longer toast.** They only expire the session on 401.
A blanket toast there fired a second, vaguer message next to the field-level
one, and shouted at users when a background read failed on mount.

Mutations are deliberately *not* given a global handler — that would reintroduce
the double message. Reads are, because a failed GET has no input to attach to.

**All mutation call sites are converted** — 63 handlers across the console, 10 in
customer, plus the website. `useMutation` sites without an `onError` were given
one; a few that only `console.log`ged (a failed wallet top-up gave the user no
feedback at all) now report properly.

## The three decisions baked in here

**1. No Next.js.** The four original apps used none of it: no SSR, no
`generateMetadata`, no middleware, no route handlers beyond `api/hello`, no
`next/image`, and 80 of admin's 142 components carried `"use client"`. Next was
a router and a bundler, and off Vercel that means operating Node processes to
serve what is a static bundle. These are Vite SPAs and an Astro site; deploy the
`dist/` directories to any CDN with an SPA-fallback rewrite on the two apps.

**2. `admin` + `merchant` are one app.** Seven of merchant's eleven route groups
already existed in admin. `src/routes/manifest.ts` is the single source of truth:
the router is built from it and the sidebar renders from the same array filtered
by session scope, so a route can't exist without nav or appear in nav without
access. Every route is lazy — a merchant never downloads a platform chunk.

**3. One pinned version per dependency.** The `catalog:` block in
`pnpm-workspace.yaml` is why the react-icons 4-vs-5 / react-query 4.29-vs-4.35
skew can't come back. Apps declare `"react": "catalog:"` and cannot drift.

## Security changes made during the port

The old apps built an S3 client **in the browser** from `NEXT_PUBLIC_ACCESS_KEY_ID`
and `NEXT_PUBLIC_SECRET_ACCESS_KEY`. Those are inlined into the JS bundle, so any
visitor could read the account's long-lived IAM credentials out of the served
JavaScript. This affected admin, merchant, and the public marketing site.

`@aws-sdk/client-s3` is gone from every frontend package. Uploads now go through
one seam per app — `apps/console/src/utils/upload.ts` and
`apps/website/src/components/merchant/services/s3.service.ts` — and are
**currently switched off**, pending a backend decision:

```ts
export const UPLOADS_ENABLED = false;   // flip to true when the endpoint is live
```

While disabled, `uploadFile()` throws `UploadUnavailableError` and every caller
shows the message and aborts the submission.

**Consequence, stated plainly:** merchant onboarding cannot complete while this
is off — the schema requires a logo, CAC certificate, and government ID. Merchant
document edits in the console are likewise blocked. This is a deliberate trade
against shipping credentials to browsers.

**Two things still need doing outside this repo:**

1. **Rotate those IAM credentials.** Treat them as public — they were.
2. **Decide the upload path and flip the flag.** The seam is written for
   presigned URLs:
   ```
   POST /uploads/presign  { fileName, contentType }
     -> { uploadUrl, fileUrl }
   ```
   If you proxy through the API instead, replace the body of `uploadFile` with a
   single multipart POST — callers only depend on
   `uploadFile(file) => Promise<string>`.

### A related bug fixed while doing this

A failed upload used to fall back to `""` (website) or `null` (console) and
submit anyway. On the website that registered a merchant with **no compliance
documents attached**; in the console it **overwrote an existing document URL
with null**. `uploadFile` now throws instead of returning a falsy value, and
both call sites abort. This matters independently of which upload design you
pick.

## Known follow-ups

**Scopes are inferred, not granted.** `src/auth/scopes.ts` derives them from
`accountType` on `/users/me`, because that is all the API returns today. The
target is an explicit `scopes` claim on the token; `scopesFor()` already prefers
it when present, so the backend can ship it without a frontend change.

**`RequireScope` is UX, not security.** It stops a merchant landing on a broken
platform screen. It does not stop them reading platform data — only the API can,
by scoping every list endpoint from the token.

**The console still has two page implementations per shared route.** Merchant
screens call `/users/merchants/me?...`, admin screens call the unscoped
endpoint — the scoping lives in the URL, not the token, so a single component is
impossible until the backend changes. The manifest expresses this as
`elementByScope`, and 67 files sit namespaced under `*/merchant/` as the
convergence backlog. Once list endpoints scope from the token, each pair
collapses to a single `element` and those files delete.

What the merge *did* de-duplicate immediately: 17 byte-identical files (Modal,
SlideOver, Loader, SearchInput, Shimmer, the remote-control tree, `useUserProfile`,
…) now have exactly one copy, plus the 8 dead files from admin's abandoned
`components/` → `features/` migration.

**Bundle weight.** `@react-pdf/renderer` is ~1.3 MB and `xlsx` ~425 kB. Both are
already isolated in their own lazy chunks, but the receipt/export features would
load faster behind a `import()` at the call site.

**Two brands are now in play.** The v2.0 website uses `primary: #000248` and IBM
Plex Sans; the console and customer apps use `primary: #0E0E63` and Sofia Pro.
`packages/config/tailwind/preset.cjs` holds the shared container/screens plus the
*apps'* palette, and `apps/website/tailwind.config.cjs` overrides colour and font
on top. That override is a deliberate marker, not an accident — someone needs to
decide whether the apps follow the site's rebrand, and then the preset becomes
the single definition again.

## Bugs found in the source and fixed

All pre-existing on `version-2.0`, not introduced by the port.

1. **Merchant registration threw on success.** `useMerchantRegistration` declares
   four parameters but `MerchantForm` called it with three, so `resetFiles` was
   `undefined` and `resetFiles()` in the mutation's `onSuccess` threw on every
   successful signup. `MerchantForm` now passes a real `resetFiles` that clears
   the three file states — `FileUpload` already resets its `<input>` when its
   `value` prop goes null, so the inputs clear properly.
2. **Broken background image.** `MerchantForm.tsx` asked for
   `/images/merchant-form-bg.png`; the asset is `merchants-form-bg.png` (plural).
   Fixed.
3. **Silent data loss on upload failure** — see the upload section above.
