import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should verify vitest is working', () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });
});
