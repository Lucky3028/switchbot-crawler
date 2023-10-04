import { z } from '@hono/zod-openapi';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type Env = {
  TRIGGERS: D1Database;
};

export type Variables = { db: DrizzleD1Database };

const timeSchema = z
  .object({
    hour: z
      .number({ invalid_type_error: 'Hour must be integer value' })
      .int({ message: 'Hour must be integer value' })
      .nonnegative({ message: 'Hour must be non-negative value' })
      .max(23, { message: 'Hour must be equal or less than 23' }),
    minute: z.number().int().nonnegative().multipleOf(5).max(55),
  })
  .openapi({ example: { hour: 12, minute: 30 } });

export const acSettingsSchema = z
  .object({
    mode: z.enum(['HOT', 'COOL'], { invalid_type_error: "Operation mode must be 'HOT' or 'COOL'." }),
    temp: z
      .number({ invalid_type_error: 'Temp must be integer value' })
      .int({ message: 'Temp must be integer value' })
      .min(16, { message: 'Temp must be equal or greater than 16' })
      .max(30, { message: 'Hour must be equal or less than 30' }),
  })
  .openapi({ example: { mode: 'COOL', temp: 25 } });

export const triggerSchema = z.object({
  id: z.string().nonempty({ message: "Trigger's ID must be nonempty" }).openapi({ example: 'W5vQ3TMBUFvaRLRf88VH' }),
  dateTime: z.date().openapi({ example: '2020-01-15T09:30:00.000Z' }),
  temp: z
    .number({ invalid_type_error: 'Temp must be integer value' })
    .int({ message: 'Temp must be integer value' })
    .nonnegative({ message: 'Temp must be non-negative value' })
    .max(40, { message: 'Temp must be equal or less than 40' })
    .openapi({ example: 35 }),
  ac: acSettingsSchema,
});

export const triggersSchema = z.array(triggerSchema);

export const defaultTriggerSchema = triggerSchema.omit({ dateTime: true }).extend({ time: timeSchema });

export const defaultTriggersSchema = z.array(defaultTriggerSchema);
