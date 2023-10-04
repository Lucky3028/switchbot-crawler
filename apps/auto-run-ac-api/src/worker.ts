import { OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { cors } from 'hono/cors';
import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { defaultTriggersApi, triggersApi } from './api';
import type { Env, Variables } from './type';

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

// NOTE: app#doc31と同等だが、一部処理を変更するために自分で実装
app.get('/docs', async (c) => {
  const definitions = app.openAPIRegistry.definitions.map((def) => {
    if (def.type === 'route') {
      // NOTE: なぜか勝手にパスの最後にスラッシュを追加してくるので、ここで削除
      return { type: def.type, route: { ...def.route, path: def.route.path.replace(/\/$/, '') } };
    }

    return def;
  });
  const generator = new OpenApiGeneratorV31(definitions);
  const config = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'auto-run-api',
    },
    security: [{ basicAuth: [] }],
  };
  const document = generator.generateDocument(config);

  return c.json(document);
});

app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.TRIGGERS));
  await next();
});

const route = app.route('/defaultTriggers', defaultTriggersApi).route('/triggers', triggersApi);

export type AppRoute = typeof route;

export default app;
