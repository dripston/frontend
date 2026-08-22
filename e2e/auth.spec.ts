import { expect, test } from '@playwright/test';

test.describe('auth pages', () => {
  test('renders the sign in form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('validates the sign in form before submitting', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('reveals the password on demand', async ({ page }) => {
    await page.goto('/login');

    const password = page.getByLabel('Password', { exact: true });
    await expect(password).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(password).toHaveAttribute('type', 'text');
  });

  test('renders the signup form with a strength meter', async ({ page }) => {
    await page.goto('/signup');

    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();
    await expect(page.getByText('Too weak')).toBeVisible();

    await page.getByLabel('Password', { exact: true }).fill('Analytical1!');
    await expect(page.getByText('Strong')).toBeVisible();
  });

  test('blocks signup until the terms are accepted', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Full name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Analytical1!');
    await page.getByLabel('Confirm password').fill('Analytical1!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText('Accept the terms to continue')).toBeVisible();
  });

  test('moves between sign in and sign up', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL(/\/signup$/);

    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('hides the assistant button on auth pages', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Open the AI assistant' })).toHaveCount(
      0,
    );

    await page.goto('/signup');
    await expect(page.getByRole('link', { name: 'Open the AI assistant' })).toHaveCount(
      0,
    );
  });
});
