import type { NodeEnv } from 'cloudflare-env';

export const isProduction = (stage: NodeEnv) => stage === 'production';
