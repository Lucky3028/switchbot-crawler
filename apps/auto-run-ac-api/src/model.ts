import { z } from 'zod';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { parseDecimalInt } from './lib';

export type Env = {
  TRIGGERS: KVNamespace;
  triggers: D1Database;
};

export type Variables = { db: DrizzleD1Database };

export const dateSchema = z.object({
  year: z
    .string()
    .transform(parseDecimalInt)
    .refine((v) => Number.isInteger(v), { message: 'Year must be an integer' })
    .refine((n) => n >= 2000, { message: 'Year must be equal or greater than 2000' }),
  month: z
    .string()
    .transform(parseDecimalInt)
    .refine((v) => Number.isInteger(v), { message: 'Month must be an integer' })
    .refine((n) => n >= 1 && n <= 12, { message: 'Month must be between 1 and 12' }),
  day: z
    .string()
    .transform(parseDecimalInt)
    .refine((v) => Number.isInteger(v), { message: 'Day must be an integer' })
    .refine((n) => n >= 1 && n <= 31, { message: 'Month must be between 1 and 31' }),
});

const timeSchema = z.object({
  hour: z
    .number({ invalid_type_error: 'Hour must be integer value' })
    .int({ message: 'Hour must be integer value' })
    .nonnegative({ message: 'Hour must be non-negative value' })
    .max(23, { message: 'Hour must be equal or less than 23' }),
  minute: z.number().int().nonnegative().multipleOf(5).max(55),
});

const acSettingsSchema = z.object({
  mode: z.enum(['HOT', 'COOL'], { invalid_type_error: "Operation mode must be 'HOT' or 'COOL'." }),
  temp: z
    .number({ invalid_type_error: 'Temp must be integer value' })
    .int({ message: 'Temp must be integer value' })
    .min(16, { message: 'Temp must be equal or greater than 16' })
    .max(30, { message: 'Hour must be equal or less than 30' }),
});

export const triggerSchema = z.object({
  id: z.string().nonempty({ message: "Trigger's ID must be nonempty" }),
  dateTime: z.date(),
  temp: z
    .number({ invalid_type_error: 'Temp must be integer value' })
    .int({ message: 'Temp must be integer value' })
    .nonnegative({ message: 'Temp must be non-negative value' })
    .max(40, { message: 'Temp must be equal or less than 40' }),
  ac: acSettingsSchema,
});

export const triggersSchema = z.array(triggerSchema);

export const defaultTriggerSchema = triggerSchema.omit({ dateTime: true }).extend({ time: timeSchema });

export const defaultTriggersSchema = z.array(defaultTriggerSchema);
