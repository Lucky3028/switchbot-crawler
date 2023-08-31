/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

declare module '__STATIC_CONTENT_MANIFEST' {
  const manifestJSON: string;

  // eslint-disable-next-line import/no-default-export
  export default manifestJSON;
}
