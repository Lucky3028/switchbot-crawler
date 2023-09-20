import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { defaultTriggersApi, triggersApi } from './api';
import type { Env, Variables } from './model';

const app = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>();

app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.triggers));
  await next();
});

const route = app
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/defaultTriggers', defaultTriggersApi)
  .route('/triggers', triggersApi);

export type AppRoute = typeof route;

export default app;
