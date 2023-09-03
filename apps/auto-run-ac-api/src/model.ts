import { z } from 'zod';

const timeSchema = z.object({
  hour: z
    .number({ invalid_type_error: 'Hour must be integer value.' })
    .int({ message: 'Hour must be integer value.' })
    .nonnegative({ message: 'Hour must be non-negative value.' })
    .max(23, { message: 'Hour must be equal or less than 23.' }),
  minute: z.number().int().nonnegative().multipleOf(5).max(55),
});

const acSettingsSchema = z.object({
  mode: z.enum(['HOT', 'COOL'], { invalid_type_error: "DriveMode must be 'HOT' or 'COOL'." }),
  temp: z
    .number({ invalid_type_error: 'Temp must be integer value.' })
    .int({ message: 'Temp must be integer value.' })
    .min(16, { message: 'Temp must be equal or greater than 16.' })
    .max(30, { message: 'Hour must be equal or less than 30.' }),
});

const triggerSchema = z.object({
  time: timeSchema,
  temp: z
    .number({ invalid_type_error: 'Temp must be integer value.' })
    .int({ message: 'Temp must be integer value.' })
    .nonnegative({ message: 'Temp must be non-negative value.' })
    .max(40, { message: 'Temp must be equal or less than 40.' }),
  ac: acSettingsSchema,
});

export const defaultTriggersSchema = z.object({
  triggers: z.array(triggerSchema),
});
