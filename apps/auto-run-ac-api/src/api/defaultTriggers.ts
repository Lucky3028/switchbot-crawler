import { triggersSchema, type Env } from '@/model';
import { OpenAPIHono } from '@hono/zod-openapi';
import type { SharedEnv } from 'cloudflare-env';
import { zValidator } from '@hono/zod-validator';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env }>();

export const defaultTriggersApi = app
  .get('/', async (c) => {
    const values = await c.env.TRIGGERS.get('defaultTriggers', { type: 'json' });
    if (!values) {
      return c.jsonT({ success: true, data: { counts: 0, triggers: [] } });
    }

    const triggers = triggersSchema.parse(values);
    const response = { triggers, counts: triggers.length };

    return c.jsonT({ success: true, data: response });
  })
  .put(
    '/',
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
      const contents = c.req.valid('json');

      c.executionCtx.waitUntil(c.env.TRIGGERS.put('defaultTriggers', JSON.stringify(contents)));

      return c.body(null, 204);
    },
  );
