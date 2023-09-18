import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultTriggersApi, triggersApi } from './api';

const app = new OpenAPIHono();

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
