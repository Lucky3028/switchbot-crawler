import { defaultTriggersSchema, type Variables, type Env } from '@/model';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { SharedEnv } from 'cloudflare-env';
import { zValidator } from '@hono/zod-validator';
import { defaultTriggersTable as table } from '@/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env; Variables: Variables }>();

export const defaultTriggersApi = app
  .openapi(
    createRoute({
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
                data: z.object({
                  counts: z.number().int().nonnegative(),
                  triggers: defaultTriggersSchema,
                }),
              }),
            },
          },
        },
      },
      method: 'get',
      path: '/',
    }),
    async (c) => {
      const values = await c.get('db').select().from(table);
      const triggers = values.map(({ triggerTime, triggerTemp, operationMode, settingsTemp }) => ({
        temp: triggerTemp,
        ac: { mode: operationMode, temp: settingsTemp },
        time: { hour: triggerTime.getUTCHours(), minute: triggerTime.getUTCMinutes() },
      }));
      const response = { triggers, counts: triggers.length };

      return c.jsonT({ success: true, data: response });
    },
  )
  .put(
    '/',
    // @ts-ignore TS7030
    // eslint-disable-next-line consistent-return
    zValidator('json', defaultTriggersSchema, (result, c) => {
      if (c.req.raw.headers.get('Content-Type') !== 'application/json') {
        return c.jsonT({ success: false, messages: ['Content-Type must be "application/json"'] }, 415);
      }
      if (!result.success) {
        return c.jsonT({ success: false, messages: result.error.issues.map((i) => i.message) }, 400);
      }
    }),
    async (c) => {
      const insertSchema = z.array(createInsertSchema(table));
      type InsertValues = z.infer<typeof insertSchema>;
      const contents = c.req.valid('json');
      const values: InsertValues = contents.map((v) => ({
        triggerTemp: v.temp,
        triggerTime: new Date(2000, 4, 15, v.time.hour, v.time.minute),
        settingsTemp: v.ac.temp,
        operationMode: v.ac.mode,
      }));

      await c.get('db').delete(table);
      await c.get('db').insert(table).values(values);

      return c.body(null, 204);
    },
  );
