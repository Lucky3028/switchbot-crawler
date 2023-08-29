import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler } from '@remix-run/cloudflare';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { basicAuth } from 'hono/basic-auth';
import { serveStatic } from 'hono/cloudflare-workers';
import * as build from 'switchbot-web/build';
import __STATIC_CONTENT_MANIFEST from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
let handleRemixRequest: ReturnType<typeof createRequestHandler>;

type ContextEnv = {
  Bindings: Env;
};

const api = new Hono<ContextEnv>();

export const app = new Hono<ContextEnv>();
app.use('*', logger());
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }));
app.use('*', (c, next) => basicAuth({ username: c.env.BASIC_AUTH_USER, password: c.env.BASIC_AUTH_PASSWORD })(c, next));
app.route('/api', api);
app.get('*', async (context) => {
  try {
    const url = new URL(context.req.url);
    const ttl = url.pathname.startsWith('/build/')
      ? 60 * 60 * 24 * 365 // 1 year
      : 60 * 5; // 5 minutes

    return await getAssetFromKV(
      {
        request: context.req.raw,
        waitUntil: (promise) => context.executionCtx.waitUntil(promise),
      },
      {
        // eslint-disable-next-line no-underscore-dangle
        ASSET_NAMESPACE: context.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
        cacheControl: {
          browserTTL: ttl,
          edgeTTL: ttl,
        },
      },
    );
  } catch (error) {
    console.error(error);
  }

  try {
    if (!handleRemixRequest) {
      handleRemixRequest = createRequestHandler(build, context.env.NODE_ENV);
    }
    const loadContext: AppLoadContext = { env: context.env };

    return await handleRemixRequest(context.req.raw, loadContext);
  } catch (error) {
    console.log(error);

    return new Response('An unexpected error occurred', { status: 500 });
  }
});
