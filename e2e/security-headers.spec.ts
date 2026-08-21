import { expect, test } from '@playwright/test';

test.describe('security headers', () => {
  test('sets the hardening headers from next.config.ts', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['strict-transport-security']).toContain('max-age=');

    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('sets a nonce-based CSP that differs per request', async ({ request }) => {
    const first = await request.get('/');
    const second = await request.get('/');

    const cspOne = first.headers()['content-security-policy'];
    const cspTwo = second.headers()['content-security-policy'];

    expect(cspOne).toContain("frame-ancestors 'none'");
    expect(cspOne).toContain("object-src 'none'");
    expect(cspOne).toMatch(/nonce-[a-f0-9]+/);

    expect(cspOne).not.toBe(cspTwo);
  });
});
