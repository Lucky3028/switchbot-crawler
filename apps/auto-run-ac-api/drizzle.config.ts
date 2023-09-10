import type { Config } from 'drizzle-kit';

// eslint-disable-next-line import/no-default-export
export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
} satisfies Config;
