import type { Trigger } from './trigger';

export const TIME_ZONE = 'Asia/Tokyo';

export const TRIGGERS: readonly Trigger[] = [
  { hour: 16, temp: 38 },
  { hour: 17, temp: 35 },
  { hour: 18, temp: 33 },
];
