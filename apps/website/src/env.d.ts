/// <reference path="../.astro/types.d.ts" />

/** Every PUBLIC_ variable the site reads, typed here as well as declared in .env.example. */
interface ImportMetaEnv {
  readonly PUBLIC_WEBSITE_URL: string;
  /** Empty means same-origin — nginx serves /v1 under this host. */
  readonly PUBLIC_BASE_URL: string;
  /** What a merchant's chosen short name becomes a subdomain of. */
  readonly PUBLIC_PORTAL_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
