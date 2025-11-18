/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_SHOW_PAGE_SELECTOR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
