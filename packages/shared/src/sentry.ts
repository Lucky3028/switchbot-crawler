import { Toucan } from 'toucan-js';

// See: https://github.com/cloudflare/worker-sentry/blob/main/index.mjs
export const initSentry = (sentryDsn: string, sentryClientId: string, sentryClientSecret: string, context: ExecutionContext) =>
  new Toucan({
    dsn: sentryDsn,
    context,
    requestDataOptions: {
      allowedHeaders: [
        'user-agent',
        'cf-challenge',
        'accept-encoding',
        'accept-language',
        'cf-ray',
        'content-length',
        'content-type',
        'x-real-ip',
        'host',
      ],
      allowedSearchParams: /(.*)/,
    },
    transportOptions: {
      headers: {
        'CF-Access-Client-ID': sentryClientId,
        'CF-Access-Client-Secret': sentryClientSecret,
      },
    },
    sampleRate: 0.25,
  });
