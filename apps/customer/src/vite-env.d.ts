/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_PAYSTACK_KEY: string;
  readonly VITE_PAYSTACK_FLAT_FEE: string;
  readonly VITE_PAYSTACK_PERCENTAGE_FEE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
