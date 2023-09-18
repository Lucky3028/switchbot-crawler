import type { SharedEnv } from 'cloudflare-env';
import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from './model';
import { defaultTriggersApi } from './api/defaultTriggers';
import { triggersApi } from './api/triggersApi';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env }>();

app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'auto-run-ac API',
  },
});

const route = app
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/defaultTriggers', defaultTriggersApi)
  .route('/triggers', triggersApi);

export type AppRoute = typeof route;

export default app;
