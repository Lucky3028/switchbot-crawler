import { type ZodRawShape, z } from 'zod';

const generateResponseSchema = (bodyObject: ZodRawShape) =>
  z.object({
    statusCode: z.number(),
    message: z.string(),
    body: z.object(bodyObject),
  });

const meterStatus = {
  deviceId: z.string(),
  deviceType: z.string(),
  temperature: z.number(),
};

export const meterStatusResponse = generateResponseSchema(meterStatus);

const airConditionerCommand = z.object({
  commandType: z.enum(['command']),
  command: z.enum(['setAll']),
  parameter: z.string(),
});

export type AirConditionerCommand = z.infer<typeof airConditionerCommand>;

export const controlCommandResponse = generateResponseSchema({});
