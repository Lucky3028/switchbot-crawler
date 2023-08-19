import { BaseError } from './base';
import type { HttpError } from './http';

export class SwitchBotApiError extends BaseError {
  constructor(message: string, cause: HttpError) {
    super(message, { cause });
  }
}
