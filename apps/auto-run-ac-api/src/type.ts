import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type Env = {
  TRIGGERS: D1Database;
};

export type Variables = { db: DrizzleD1Database };
