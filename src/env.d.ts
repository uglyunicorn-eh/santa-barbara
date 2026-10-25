/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Talk to another API, such as a backend preview (local development only). */
  readonly PUBLIC_API_ENDPOINT?: string;
  /** The public key that API signs tokens with, when it isn't production's. */
  readonly PUBLIC_JWT_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
