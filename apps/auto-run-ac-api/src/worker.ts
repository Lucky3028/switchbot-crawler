import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { cors } from 'hono/cors';
import { defaultTriggersApi, triggersApi } from './api';
import type { Env, Variables } from './model';

const app = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

app.get('/', (c) => c.text('Hello Hono!'));

// TODO: fix CORS origin
app.use(
  '*',
  cors({
    origin: ['http://localhost:8080'],
  }),
);

app.openAPIRegistry.registerComponent('securitySchemes', 'basicAuth', { type: 'http', scheme: 'basic' });

app.doc31('/docs', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'auto-run-api',
  },
  security: [{ basicAuth: [] }],
});

app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.triggers));
  await next();
});

const route = app.route('/defaultTriggers/*', defaultTriggersApi).route('/triggers/*', triggersApi);

export type AppRoute = typeof route;

export default app;
