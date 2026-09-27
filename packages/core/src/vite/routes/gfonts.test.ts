import { describe, expect, it } from 'vitest';
import { clampLimit, isGstaticHost } from './gfonts.ts';

describe('isGstaticHost', () => {
  it('accepts gstatic.com and its subdomains', () => {
    expect(isGstaticHost('gstatic.com')).toBe(true);
    expect(isGstaticHost('fonts.gstatic.com')).toBe(true);
    expect(isGstaticHost('FONTS.GSTATIC.COM')).toBe(true);
  });

  it('rejects lookalike hosts', () => {
    expect(isGstaticHost('evilgstatic.com')).toBe(false);
    expect(isGstaticHost('gstatic.com.evil.test')).toBe(false);
    expect(isGstaticHost('example.com')).toBe(false);
  });
});

describe('clampLimit', () => {
  it('defaults when the value is missing, invalid, or non-positive', () => {
    expect(clampLimit(null)).toBe(30);
    expect(clampLimit('')).toBe(30);
    expect(clampLimit('abc')).toBe(30);
    expect(clampLimit('0')).toBe(30);
    expect(clampLimit('-5')).toBe(30);
  });

  it('floors fractional values and caps at 100', () => {
    expect(clampLimit('12.9')).toBe(12);
    expect(clampLimit('100')).toBe(100);
    expect(clampLimit('5000')).toBe(100);
    expect(clampLimit('Infinity')).toBe(30);
  });
});
