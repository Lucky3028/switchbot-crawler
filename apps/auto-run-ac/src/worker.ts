import { scheduled, type Handlers } from './handler';

/**
 * Workerのエントリーポイント
 */
const entryPoint: Handlers = { scheduled };

export default entryPoint;
