import { Toucan } from 'toucan-js';

/**
 * Sentryのクライアントを生成する
 * @param sentryDsn [SentryのDSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/)
 * @param cloudflareAccessClientId [CloudflareAccessのServiceToken](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/)で発行されるClientID
 * @param cloudflareAccessClientSecret [CloudflareAccessのServiceToken](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/)で発行されるClientSecret
 * @param context CloudflareWorkerのContext
 * @returns Sentryクライアントのインスタンス
 * @see https://github.com/cloudflare/worker-sentry/blob/main/index.mjs
 */
export const initSentry = (
  sentryDsn: string,
  cloudflareAccessClientId: string,
  cloudflareAccessClientSecret: string,
  context: ExecutionContext,
) =>
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
        'CF-Access-Client-ID': cloudflareAccessClientId,
        'CF-Access-Client-Secret': cloudflareAccessClientSecret,
      },
    },
    sampleRate: 0.25,
  });
