import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultTriggersApi, triggersApi } from './api';

const app = new OpenAPIHono();

const route = app
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/defaultTriggers', defaultTriggersApi)
  .route('/triggers', triggersApi);

export type AppRoute = typeof route;

export default app;
