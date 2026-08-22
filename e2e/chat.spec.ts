import { expect, test } from '@playwright/test';

test.describe('assistant', () => {
  test('is reachable from the floating button on the models page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Open the AI assistant' }).click();

    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByRole('heading', { name: 'Assistant' })).toBeVisible();
  });

  test('hides the floating button once on the chat route', async ({ page }) => {
    await page.goto('/chat');

    await expect(page.getByRole('link', { name: 'Open the AI assistant' })).toHaveCount(
      0,
    );
  });

  test('answers a suggested prompt with formatted output', async ({ page }) => {
    await page.goto('/chat');

    await page.getByRole('button', { name: 'How do I add a shadcn component?' }).click();

    await expect(page.getByText('pnpm dlx shadcn@latest add dialog')).toBeVisible();
    await expect(page.locator('figure').first()).toBeVisible();
  });

  test('sends a typed message with Enter', async ({ page }) => {
    await page.goto('/chat');

    const input = page.getByRole('textbox', { name: 'Message the assistant' });
    await input.fill('how is this repo structured?');
    await input.press('Enter');

    await expect(page.getByRole('heading', { name: 'Repository layout' })).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('returns to the models page from the header', async ({ page }) => {
    await page.goto('/chat');

    await page.getByRole('link', { name: 'Back to models' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Models' })).toBeVisible();
  });
});
