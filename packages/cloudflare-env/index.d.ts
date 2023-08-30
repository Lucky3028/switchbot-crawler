/// <reference types="@cloudflare/workers-types" />

type NodeEnv = 'production' | 'dev';

type Env = {
  __STATIC_CONTENT: KVNamespace;

  HISTORY: KVNamespace;

  // region wrangler.tomlに直接書き込まれている環境変数
  METER_DEVICE_ID: string;
  AIR_CONDITIONER_DEVICE_ID: string;
  SENTRY_DSN: string;
  // endregion

  // region GitHubの秘密変数に設定があって、GitHubActionsによって注入されている環境変数
  NODE_ENV: NodeEnv;
  SWITCHBOT_TOKEN: string;
  SWITCHBOT_CLIENT_SECRET: string;
  SENTRY_CLIENT_ID: string;
  SENTRY_CLIENT_SECRET: string;
  NOTIFICATION_WEBHOOK_URL: string;
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASSWORD: string;
  // endregion
};
