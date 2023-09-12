import type { SharedEnv } from 'cloudflare-env';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { dateSchema, triggersSchema } from './model';

type Env = {
  TRIGGERS: KVNamespace;
  triggers: D1Database;
};

const app = new Hono<{ Bindings: SharedEnv & Env }>().basePath('/api');

const route = app
  .get('/', (c) => c.text('Hello Hono!'))
  .get('/defaultTriggers', async (c) => {
    const values = await c.env.TRIGGERS.get('defaultTriggers', { type: 'json' });
    if (!values) {
      return c.jsonT({ success: true, data: { counts: 0, triggers: [] } });
    }

    const triggers = triggersSchema.parse(values);
    const response = { triggers, counts: triggers.length };

    return c.jsonT({ success: true, data: response });
  })
  .put(
    // @ts-ignore TS7030
    // eslint-disable-next-line consistent-return
    zValidator('json', triggersSchema, (result, c) => {
      if (c.req.headers.get('Content-Type') !== 'application/json') {
        return c.jsonT({ success: false, messages: ['Content-Type must be "application/json"'] }, 415);
      }
      if (!result.success) {
        return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
      }
    }),
    async (c) => {
      const contents = c.req.valid('json');

      c.executionCtx.waitUntil(c.env.TRIGGERS.put('defaultTriggers', JSON.stringify(contents)));

      return c.body(null, 204);
    },
  )
  .get(
    '/triggers/:year/:month/:day',
    zValidator(
      'param',
      dateSchema,
      // @ts-ignore TS7030
      // eslint-disable-next-line consistent-return
      (result, c) => {
        if (!result.success) {
          return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
        }
      },
    ),
    async (c) => {
      const { year, month, day } = c.req.valid('param');
      const value = await c.env.TRIGGERS.get(`triggers/${year}/${month}/${day}`, { type: 'json' });
      if (!value) {
        const values = await c.env.TRIGGERS.get('defaultTriggers', { type: 'json' });
        if (!values) {
          return c.jsonT({ success: true, data: { counts: 0, triggers: [] } });
        }

        const triggers = triggersSchema.parse(values);

        return c.jsonT({ success: true, data: { triggers, counts: triggers.length } });
      }

      const triggers = triggersSchema.parse(value);

      return c.jsonT({ success: true, data: { triggers, counts: triggers.length } });
    },
  )
  .put(
    zValidator(
      'param',
      dateSchema,
      // @ts-ignore TS7030
      // eslint-disable-next-line consistent-return
      (result, c) => {
        if (!result.success) {
          return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
        }
      },
    ),
    // @ts-ignore TS7030
    // eslint-disable-next-line consistent-return
    zValidator('json', triggersSchema, (result, c) => {
      if (c.req.headers.get('Content-Type') !== 'application/json') {
        return c.jsonT({ success: false, messages: ['Content-Type must be "application/json"'] }, 415);
      }
      if (!result.success) {
        return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
      }
    }),
    async (c) => {
      const { year, month, day } = c.req.valid('param');
      const contents = c.req.valid('json');

      c.executionCtx.waitUntil(c.env.TRIGGERS.put(`triggers/${year}/${month}/${day}`, JSON.stringify(contents)));

      return c.body(null, 204);
    },
  )
  .delete(
    zValidator(
      'param',
      dateSchema,
      // @ts-ignore TS7030
      // eslint-disable-next-line consistent-return
      (result, c) => {
        if (!result.success) {
          return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
        }
      },
    ),
    async (c) => {
      const { year, month, day } = c.req.valid('param');

      c.executionCtx.waitUntil(c.env.TRIGGERS.delete(`triggers/${year}/${month}/${day}`));

      return c.body(null, 204);
    },
  );

export type ApiRoute = typeof route;

export default app;
