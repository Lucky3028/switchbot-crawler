import { initSentry, isProduction, switchbot } from 'shared';
import { formatDate, getUtcDate, isBannedHour, isWeekend } from '@/lib/date';
import { TIME_ZONE, TRIGGERS } from '@/lib/const';
import { notifyAirConditionerOnToDiscord } from '@/lib/discord';
import { filterValidTrigger } from '@/lib/trigger';
import { isHoliday } from '@holiday-jp/holiday_jp';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * 与えられた日付において、本プログラムによってエアコンがつけられたかどうかを返す
 * @param date 確認したい日付
 * @param kv Cloudflare KVのインスタンス
 * @returns 与えられた日付において、本プログラムによってエアコンがつけられたかどうか
 */
const isAlreadyTurnedOnToday = async (date: string, kv: KVNamespace) => kv.get(date).then((v) => !!v);

type Env = {
  AUTO_RUN_AC_API: Fetcher;

  HISTORY: KVNamespace;

  METER_DEVICE_ID: string;
  AIR_CONDITIONER_DEVICE_ID: string;
  SWITCHBOT_TOKEN: string;
  SWITCHBOT_CLIENT_SECRET: string;
  NOTIFICATION_WEBHOOK_URL: string;
};
export type Handlers = ExportedHandler<SharedEnv & Env>;

export const scheduled: Required<Handlers>['scheduled'] = async (_event, env, ctx) => {
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
    if (e instanceof Error && isProduction(env.NODE_ENV)) {
      sentry.captureException(e);
    }
  }
};
