import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler } from '@remix-run/cloudflare';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { basicAuth } from 'hono/basic-auth';
import { serveStatic } from 'hono/cloudflare-workers';
import * as build from 'switchbot-web/build';
import __STATIC_CONTENT_MANIFEST from '__STATIC_CONTENT_MANIFEST';
import { initSentry, isProduction } from 'shared';
import type { RequiredHandlers } from '@/lib/handler';

const assetManifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
let handleRemixRequest: ReturnType<typeof createRequestHandler>;

type ContextEnv = {
  Bindings: Env;
};

const api = new Hono<ContextEnv>();
// ヘルスチェック用エンドポイント

const app = new Hono<ContextEnv>();

// ミドルウェア
app.use('*', logger());
// favicon
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }));
// ミドルウェア
app.use('*', (c, next) => basicAuth({ username: c.env.BASIC_AUTH_USER, password: c.env.BASIC_AUTH_PASSWORD })(c, next));
// API
app.route('/api/*', api);
// Remix
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

export const fetch: RequiredHandlers['fetch'] = (req) => app.fetch(req);
