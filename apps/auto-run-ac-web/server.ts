import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler, logDevReady } from '@remix-run/cloudflare';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as build from '@remix-run/dev/server-build';
import __STATIC_CONTENT_MANIFEST from '__STATIC_CONTENT_MANIFEST';
import { Hono } from 'hono';
import { initSentry, isProduction } from 'shared';

const assetManifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
let handleRemixRequest: ReturnType<typeof createRequestHandler>;

if (process.env.NODE_ENV === 'development') {
  logDevReady(build);
}

type Env = { AUTO_RUN_AC_API: Fetcher };
const app = new Hono<{ Bindings: SharedEnv & Env }>();

app.get('*', async (ctx) => {
  const sentry = initSentry(ctx.env.SENTRY_DSN, ctx.env.SENTRY_CLIENT_ID, ctx.env.SENTRY_CLIENT_SECRET, ctx.executionCtx);
  const isProd = isProduction(ctx.env.NODE_ENV);

  try {
    const url = new URL(ctx.req.url);
    const ttl = url.pathname.startsWith('/build/')
      ? 60 * 60 * 24 * 365 // 1 year
      : 60 * 5; // 5 minutes

    return await getAssetFromKV(
      {
        request: ctx.req.raw,
        waitUntil: (promise) => ctx.executionCtx.waitUntil(promise),
      },
      {
        // eslint-disable-next-line no-underscore-dangle
        ASSET_NAMESPACE: ctx.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
        cacheControl: {
          browserTTL: ttl,
          edgeTTL: ttl,
        },
      },
    );
  } catch (error) {
    if (isProd) {
      sentry.captureException(error);
    }
  }

  try {
    if (!handleRemixRequest) {
      handleRemixRequest = createRequestHandler(build, ctx.env.NODE_ENV);
    }
    const loadContext: AppLoadContext = { env: ctx.env };

    return await handleRemixRequest(ctx.req.raw, loadContext);
  } catch (error) {
    if (isProd) {
      sentry.captureException(error);
    }

    return new Response('An unexpected error occurred', { status: 500 });
  }
});

export default {
  fetch: app.fetch,
};
