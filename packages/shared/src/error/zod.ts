import type { ZodError } from 'zod';
import { BaseError } from './base';

export class CustomZodError extends BaseError {
  constructor(contents: string, cause: ZodError) {
    super(`Failed to parse ${contents}.`, { cause });
  }
}
