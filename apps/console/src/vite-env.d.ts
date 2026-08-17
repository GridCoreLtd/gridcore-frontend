/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Empty for same-origin. Any other value must be same-site, or the cookie is never sent. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
