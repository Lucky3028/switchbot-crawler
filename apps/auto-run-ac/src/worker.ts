import { app, scheduled } from './handlers';

/**
 * Workerのエントリーポイント
 */
export default {
  fetch: app.fetch,
  scheduled,
};
