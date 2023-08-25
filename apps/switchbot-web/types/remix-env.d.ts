/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare/globals" />

type LoadContext = {
  env: Env;
};

declare const process: {
  env: { NODE_ENV: 'development' | 'production' };
};

declare module '@remix-run/cloudflare' {
  import type { DataFunctionArgs as RemixDataFunctionArgs } from '@remix-run/cloudflare/dist/index';

  export * from '@remix-run/cloudflare/dist/index';

  export type DataFunctionArgs = Omit<RemixDataFunctionArgs, 'context'> & { context: LoadContext };
}
