import { expect, test } from '@playwright/test';

test.describe('health endpoint', () => {
  test('returns 200 with a status payload', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);

    const body: unknown = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('timestamp');
  });

  test('is never cached', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.headers()['cache-control']).toContain('no-store');
  });
});
