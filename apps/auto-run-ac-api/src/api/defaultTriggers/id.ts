import { defaultTriggerSchema, type Variables } from '@/model';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { SharedEnv } from 'cloudflare-env';
import { eq } from 'drizzle-orm';
import type { Env } from 'hono';
import { defaultTriggersTable as table } from '@/db/schema';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env; Variables: Variables }>();

export const defaultTriggerApi = app.openapi(
  createRoute({
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'The trigger is found',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean(), data: z.object({ trigger: defaultTriggerSchema }) }),
          },
        },
      },
      404: {
        description: 'The trigger is not found',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
    },
    method: 'get',
    path: '/',
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [value, ..._others] = await c.get('db').select().from(table).where(eq(table.id, id));

    if (!value) {
      return c.jsonT({ success: false }, 404);
    }

    const trigger = {
      ...value,
      temp: value.triggerTemp,
      ac: { mode: value.operationMode, temp: value.settingsTemp },
      time: { hour: value.triggerTime.getUTCHours(), minute: value.triggerTime.getUTCMinutes() },
    };

    return c.jsonT({ success: true, data: { trigger } });
  },
);
