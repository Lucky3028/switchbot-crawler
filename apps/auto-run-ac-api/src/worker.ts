import { Hono } from 'hono';

const app = new Hono().basePath('/api');

const route = app.get('/', (c) => c.text('Hello Hono!'));

export type ApiRoute = typeof route;

export default app;
