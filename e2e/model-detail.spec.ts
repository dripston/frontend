import { expect, test } from '@playwright/test';

test.describe('model detail', () => {
  test('opens from a card on the models page', async ({ page }) => {
    await page.goto('/');

    const first = page.getByRole('listitem').first();
    const name = await first.getByRole('link').first().textContent();
    await first.getByRole('link').first().click();

    await expect(page).toHaveURL(/\/models\/mdl_[A-Za-z0-9]{8}$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name ?? '');
  });

  test('shows the id, tags and sidebar figures', async ({ page }) => {
    await page.goto('/models/mdl_7Kq2XvN4');

    await expect(page.getByText('mdl_7Kq2XvN4')).toBeVisible();
    await expect(page.getByText('Image-Text-to-Text', { exact: true })).toBeVisible();
    await expect(page.getByText('Downloads last month')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Model tree' })).toBeVisible();
    await expect(page.getByRole('img', { name: /downloads/i })).toBeVisible();
  });

  test('switches between the card, files and community tabs', async ({ page }) => {
    await page.goto('/models/mdl_7Kq2XvN4');

    await expect(page.getByRole('heading', { name: 'Model overview' })).toBeVisible();

    await page.getByRole('tab', { name: /Files and versions/ }).click();
    await expect(page.getByText('model.safetensors')).toBeVisible();

    await page.getByRole('tab', { name: 'Community' }).click();
    await expect(page.getByText('No discussions yet.')).toBeVisible();
  });

  test('returns to the models list', async ({ page }) => {
    await page.goto('/models/mdl_7Kq2XvN4');

    await page.getByRole('link', { name: '← Models' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Models' })).toBeVisible();
  });

  test('404s on an unknown id', async ({ page }) => {
    const response = await page.goto('/models/mdl_00000000');

    expect(response?.status()).toBe(404);
  });
});
