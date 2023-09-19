// eslint-disable-next-line import/no-extraneous-dependencies
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

const tempColumn = integer('trigger_temp').notNull();
const operationModeColumn = text('operation_mode', { enum: ['HOT', 'COOL'] }).notNull();
const settingsTempColumn = integer('settings_temp').notNull();

export const defaultTriggersTable = sqliteTable(
  'default_triggers',
  {
    triggerTime: integer('trigger_time', { mode: 'timestamp' }).notNull(),
    triggerTemp: tempColumn,
    operationMode: operationModeColumn,
    settingsTemp: settingsTempColumn,
  },
  (table) => ({
    unq: unique().on(table.triggerTime, table.operationMode),
  }),
);

export const dateTriggersTable = sqliteTable(
  'date_triggers',
  {
    id: text('id').primaryKey(),
    triggerDateTime: integer('trigger_date_time', { mode: 'timestamp' }).notNull(),
    triggerTemp: tempColumn,
    operationMode: operationModeColumn,
    settingsTemp: settingsTempColumn,
  },
  (table) => ({
    unq: unique().on(table.triggerDateTime, table.operationMode),
  }),
);
