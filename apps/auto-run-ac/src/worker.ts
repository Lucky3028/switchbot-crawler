import { isWeekend } from 'date-fns';
import { initSentry, switchbot } from 'shared';
import { utcToZonedTime } from 'date-fns-tz';
import { isHoliday } from '@holiday-jp/holiday_jp';
import __STATIC_CONTENT_MANIFEST from '__STATIC_CONTENT_MANIFEST';
import * as build from 'switchbot-web/build';
import { Hono } from 'hono';
import type { AppLoadContext } from '@remix-run/cloudflare';
import { createRequestHandler } from '@remix-run/cloudflare';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { getUtcDate, isBannedHour, formatDate } from './lib/date';
import { notifyAirConditionerOnToDiscord } from './lib/discord';
import { TIME_ZONE, TRIGGERS } from './lib/const';
import { filterValidTrigger } from './lib/trigger';

/**
 * 与えられた日付において、本プログラムによってエアコンがつけられたかどうかを返す
 * @param date 確認したい日付
 * @param kv Cloudflare KVのインスタンス
 * @returns 与えられた日付において、本プログラムによってエアコンがつけられたかどうか
 */
const isAlreadyTurnedOnToday = async (date: string, kv: KVNamespace) => kv.get(date).then((v) => !!v);

const assetManifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
let handleRemixRequest: ReturnType<typeof createRequestHandler>;

type ContextEnv = {
  Bindings: Env;
};
const app = new Hono<ContextEnv>();

app.get('/api', (c) => c.text(`Hello Cloudflare Workers!${c.env.METER_DEVICE_ID}`));
app.get('*', async (context) => {
  try {
    const url = new URL(context.req.url);
    const ttl = url.pathname.startsWith('/build/')
      ? 60 * 60 * 24 * 365 // 1 year
      : 60 * 5; // 5 minutes

    return await getAssetFromKV(
      {
        request: context.req.raw,
        waitUntil: (promise) => context.executionCtx.waitUntil(promise),
      },
      {
        // eslint-disable-next-line no-underscore-dangle
        ASSET_NAMESPACE: context.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
        cacheControl: {
          browserTTL: ttl,
          edgeTTL: ttl,
        },
      },
    );
  } catch (error) {
    console.error(error);
  }

  try {
    if (!handleRemixRequest) {
      handleRemixRequest = createRequestHandler(build, context.env.NODE_ENV);
    }
    const loadContext: AppLoadContext = { env: context.env };

    return await handleRemixRequest(context.req.raw, loadContext);
  } catch (error) {
    console.log(error);

    return new Response('An unexpected error occurred', { status: 500 });
  }
});

/**
 * エントリーポイント
 */
export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> => {
    const sentry = initSentry(env.SENTRY_DSN, env.SENTRY_CLIENT_ID, env.SENTRY_CLIENT_SECRET, ctx);

    try {
      const utcNow = getUtcDate(new Date());
      const jstNow = utcToZonedTime(utcNow, TIME_ZONE);
      if (isWeekend(jstNow.getDay()) || isHoliday(jstNow)) return;
      if (isBannedHour(jstNow.getHours())) return;
      const formattedDate = formatDate(jstNow);
      if (await isAlreadyTurnedOnToday(formattedDate, env.HISTORY)) return;

      const triggerTemps = [...new Set(filterValidTrigger(TRIGGERS, jstNow.getHours()).map((t) => t.temp))];
      if (triggerTemps.length === 0) return;

      const client = switchbot({ token: env.SWITCHBOT_TOKEN, secret: env.SWITCHBOT_CLIENT_SECRET });
      const actualTemp = await client.getMeterStatus(env.METER_DEVICE_ID).then((stat) => stat.temperature);
      const isTempHigherThanTriggers = !!triggerTemps.find((triggerTemp) => actualTemp >= triggerTemp);
      if (!isTempHigherThanTriggers) return;

      await client.turnOnAirConditioner(env.AIR_CONDITIONER_DEVICE_ID, 28);
      // 1日でKVに書き込んだものを削除
      await env.HISTORY.put(formattedDate, 'done!', { expirationTtl: 60 * 60 * 24 });
      await notifyAirConditionerOnToDiscord(env.NOTIFICATION_WEBHOOK_URL, utcNow, actualTemp);
    } catch (e: unknown) {
      if (e instanceof Error && env.NODE_ENV === 'production') {
        sentry.captureException(e);
      }
    }
  },
};
