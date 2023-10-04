// eslint-disable-next-line import/no-extraneous-dependencies
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

const id = text('id').primaryKey();
const triggerTemp = integer('trigger_temp').notNull();
const operationMode = text('operation_mode', { enum: ['HOT', 'COOL'] }).notNull();
const settingsTemp = integer('settings_temp').notNull();

export const defaultTriggersTable = sqliteTable(
  'default_triggers',
  {
    id,
    triggerTime: integer('trigger_time', { mode: 'timestamp' }).notNull(),
    triggerTemp,
    operationMode,
    settingsTemp,
  },
  (table) => ({
    unq: unique().on(table.triggerTime, table.operationMode),
  }),
);

export const dateTriggersTable = sqliteTable(
  'date_triggers',
  {
    id,
    triggerDateTime: integer('trigger_date_time', { mode: 'timestamp' }).notNull(),
    triggerTemp,
    operationMode,
    settingsTemp,
  },
  (table) => ({
    unq: unique().on(table.triggerDateTime, table.operationMode),
  }),
);
