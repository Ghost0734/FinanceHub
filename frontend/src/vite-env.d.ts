/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute backend origin. Empty/unset means use the Vite `/api` proxy. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
