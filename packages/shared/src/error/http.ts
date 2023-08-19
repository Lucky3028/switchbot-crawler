import { BaseError } from './base';

export class HttpError extends BaseError {
  constructor(message: string, path: string, httpStatus: number, httpStatusMessage: string) {
    super(message, { info: { path, httpStatus, httpStatusMessage } });
  }
}
