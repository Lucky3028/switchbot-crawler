export class BaseError extends Error {
  info: Record<string, unknown>;

  constructor(message: string, { cause, info = {} }: { cause?: Error; info?: Record<string, unknown> }) {
    super(message, { cause });
    this.info = info;
  }
}
