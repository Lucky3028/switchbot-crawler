import { describe, expect, it } from 'vitest';
import { formatDate, isBannedHour, isWeekend } from './date';

describe('isWeekend', () => {
  it.each([0, 6])('should return true when given %i', (num) => {
    expect(isWeekend(num)).toBeTruthy();
  });

  it.each([-1, 1, 5, 7])('should return false when given %i', (num) => {
    expect(isWeekend(num)).toBeFalsy();
  });
});

describe('isBannedHour', () => {
  it.each([0, 1, 5, 6])('should return true when given %i', (num) => {
    expect(isBannedHour(num)).toBeTruthy();
  });

  it.each([-1, 7])('should return false when given %i', (num) => {
    expect(isBannedHour(num)).toBeFalsy();
  });
});

describe('formatDate', () => {
  it('should format date', () => {
    const YEAR = 2023;
    const MONTH = 10;
    const DAY = 15;

    expect(formatDate(new Date(YEAR, MONTH, DAY))).toBe(`${YEAR}-${MONTH + 1}-${DAY}`);
  });
});
