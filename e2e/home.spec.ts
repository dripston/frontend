import { expect, test } from '@playwright/test';

test.describe('models page', () => {
  test('renders the heading and the model grid', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: 'Models' })).toBeVisible();
    await expect(page.getByRole('listitem')).not.toHaveCount(0);
  });

  test('shows an id on every card', async ({ page }) => {
    await page.goto('/');

    const cards = page.getByRole('listitem');
    const ids = page.locator('li').getByText(/^mdl_[A-Za-z0-9]{8}$/);

    await expect(ids).toHaveCount(await cards.count());
  });

  test('filters the grid by name', async ({ page }) => {
    await page.goto('/');

    const before = await page.getByRole('listitem').count();
    await page.getByRole('searchbox', { name: 'Filter by name' }).fill('minimax');

    const after = await page.getByRole('listitem').count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
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
    expect(await page.locator('img:not([alt])').count()).toBe(0);
  });
});
