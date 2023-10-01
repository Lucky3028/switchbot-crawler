import { triggersSchema, type Env, type Variables, triggerSchema, acSettingsSchema } from '@/model';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { SharedEnv } from 'cloudflare-env';
import { dateTriggersTable as table } from '@/db/schema';
import { emptyJsonT, getUrl, nanoid } from '@/lib';
import { eq } from 'drizzle-orm';

const app = new OpenAPIHono<{ Bindings: SharedEnv & Env; Variables: Variables }>();

export const triggersApi = app
  .openapi(
    createRoute({
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: z.object({ triggers: triggersSchema }),
            },
          },
        },
      },
      method: 'get',
      path: '/',
    }),
    async (c) => {
      const values = await c.get('db').select().from(table);
      const triggers = values.map(({ triggerDateTime, triggerTemp, operationMode, settingsTemp, ...v }) => ({
        ...v,
        temp: triggerTemp,
        ac: { mode: operationMode, temp: settingsTemp },
        dateTime: triggerDateTime,
      }));

      return c.jsonT({ triggers });
    },
  )
  .openapi(
    createRoute({
      request: {
        body: {
          content: {
            'application/json': {
              schema: triggerSchema.omit({ id: true }),
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Trigger is created',
          content: {
            'application/json': {
              schema: z.object({ trigger: triggerSchema }),
            },
          },
        },
      },
      method: 'post',
      path: '/',
    }),
    async (c) => {
      const contents = c.req.valid('json');

      const id = nanoid();
      await c
        .get('db')
        .insert(table)
        .values({
          id,
          triggerTemp: contents.temp,
          triggerDateTime: contents.dateTime,
          settingsTemp: contents.ac.temp,
          operationMode: contents.ac.mode,
        })
        .onConflictDoNothing();
      const trigger = { ...contents, id };

      return c.jsonT({ trigger }, 201, { Location: `${getUrl(c.req)}/${id}` });
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
      },
      responses: {
        200: {
          description: 'The trigger is found',
          content: {
            'application/json': {
              schema: z.object({ trigger: triggerSchema }),
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
      path: '/{id}',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const [value] = await c.get('db').select().from(table).where(eq(table.id, id));

      if (!value) {
        return c.jsonT({ success: false }, 404);
      }

      const trigger = {
        ...value,
        temp: value.triggerTemp,
        ac: { mode: value.operationMode, temp: value.settingsTemp },
        dateTime: value.triggerDateTime,
      };

      return c.jsonT({ trigger });
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: triggerSchema.pick({ dateTime: true }),
            },
          },
        },
      },
      responses: {
        204: {
          description: 'The trigger is modified',
        },
      },
      method: 'put',
      path: '/{id}/dateTime',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const { dateTime } = c.req.valid('json');
      await c.get('db').update(table).set({ triggerDateTime: dateTime }).where(eq(table.id, id));

      return emptyJsonT(c, 204);
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: triggerSchema.pick({ temp: true }),
            },
          },
        },
      },
      responses: {
        204: {
          description: 'The trigger is modified',
        },
      },
      method: 'put',
      path: '/{id}/temp',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const { temp } = c.req.valid('json');
      await c.get('db').update(table).set({ triggerTemp: temp }).where(eq(table.id, id));

      return emptyJsonT(c, 204);
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: acSettingsSchema.pick({ mode: true }),
            },
          },
        },
      },
      responses: {
        204: {
          description: 'The trigger is modified',
        },
      },
      method: 'put',
      path: '/{id}/acMode',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const { mode } = c.req.valid('json');
      await c.get('db').update(table).set({ operationMode: mode }).where(eq(table.id, id));

      return emptyJsonT(c, 204);
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            'application/json': {
              schema: acSettingsSchema.pick({ temp: true }),
            },
          },
        },
      },
      responses: {
        204: {
          description: 'The trigger is modified',
        },
      },
      method: 'put',
      path: '/{id}/acTemp',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      const { temp } = c.req.valid('json');
      await c.get('db').update(table).set({ settingsTemp: temp }).where(eq(table.id, id));

      return emptyJsonT(c, 204);
    },
  )
  .openapi(
    createRoute({
      request: {
        params: z.object({ id: z.string() }),
      },
      responses: {
        204: {
          description: 'The trigger is deleted',
        },
      },
      method: 'delete',
      path: '/{id}',
    }),
    async (c) => {
      const { id } = c.req.valid('param');
      await c.get('db').delete(table).where(eq(table.id, id));

      return emptyJsonT(c, 204);
    },
  );
