export type NodeEnv = 'production' | 'development';

export type SharedEnv = {
  __STATIC_CONTENT: KVNamespace;

  // region wrangler.tomlに直接書き込まれている環境変数
  SENTRY_DSN: string;
  // endregion

  // region GitHubの秘密変数に設定があって、GitHubActionsによって注入されている環境変数
  NODE_ENV: NodeEnv;
  SENTRY_CLIENT_ID: string;
  SENTRY_CLIENT_SECRET: string;
  // endregion
};
