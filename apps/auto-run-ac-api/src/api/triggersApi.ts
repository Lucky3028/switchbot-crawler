import { dateSchema, triggersSchema, type Env, type Variables } from '@/model';
import { OpenAPIHono } from '@hono/zod-openapi';
import { zValidator } from '@hono/zod-validator';
import type { SharedEnv } from 'cloudflare-env';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env; Variables: Variables }>();

export const triggersApi = app
  .get(
    '/:year/:month/:day',
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
    '/:year/:month/:day',
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
      if (c.req.raw.headers.get('Content-Type') !== 'application/json') {
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
    '/:year/:month/:day',
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
