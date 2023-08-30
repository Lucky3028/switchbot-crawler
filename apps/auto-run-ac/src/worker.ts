import { fetch, scheduled } from '@/handlers';
import type { Handlers } from '@/lib/handler';

/**
 * Workerのエントリーポイント
 */
const entryPoint: Handlers = { fetch, scheduled };

export default entryPoint;
