import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the heading and feature list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('listitem')).not.toHaveCount(0);
  });

  test('has a document title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('serves an unknown route as a 404 page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });

  test('has no severe accessibility violations in the page structure', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });
});
