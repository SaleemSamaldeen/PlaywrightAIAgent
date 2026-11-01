// spec: tests/dashboard.spec.js
// seed: seed.spec.js
// target: https://opensource-demo.orangehrmlive.com

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php';
const CREDENTIALS = { username: 'Admin', password: 'admin123' };

async function login(page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByRole('textbox', { name: 'Username' }).fill(CREDENTIALS.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(`**\/dashboard\/index`);
}

test.describe('OrangeHRM Dashboard', () => {

  // ── Test 1: Successful Login & Dashboard Load ────────────────────────────
  test('should login successfully and land on the dashboard', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto(`${BASE_URL}/auth/login`);

    // 2. Fill in username
    await page.getByRole('textbox', { name: 'Username' }).fill(CREDENTIALS.username);

    // 3. Fill in password
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.password);

    // 4. Click Login
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert: redirected to dashboard
    await expect(page).toHaveURL(/dashboard\/index/);

    // Assert: Dashboard heading visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Assert: Sidebar navigation is present
    await expect(page.getByRole('navigation', { name: 'Sidepanel' })).toBeVisible();
  });

  // ── Test 2: Sidebar Navigation Links ────────────────────────────────────
  test('should display all 12 sidebar navigation links', async ({ page }) => {
    await login(page);

    const expectedLinks = [
      'Admin', 'PIM', 'Leave', 'Time', 'Recruitment',
      'My Info', 'Performance', 'Dashboard', 'Directory',
      'Maintenance', 'Claim', 'Buzz',
    ];

    const sidebar = page.getByRole('navigation', { name: 'Sidepanel' });

    for (const label of expectedLinks) {
      // Assert each nav link is visible in the sidebar
      await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
    }
  });

  // ── Test 3: Dashboard Widgets Visible ───────────────────────────────────
  test('should display all dashboard widgets', async ({ page }) => {
    await login(page);

    const expectedWidgets = [
      'Time at Work',
      'My Actions',
      'Quick Launch',
      'Buzz Latest Posts',
      'Employees on Leave Today',
      'Employee Distribution by Sub Unit',
      'Employee Distribution by Location',
    ];

    for (const widget of expectedWidgets) {
      // Assert each widget heading is visible on the dashboard
      await expect(page.getByText(widget, { exact: true })).toBeVisible();
    }
  });

  // ── Test 4: Quick Launch Buttons Navigate Correctly ──────────────────────
  test('should navigate to Assign Leave from Quick Launch', async ({ page }) => {
    await login(page);

    // Click Assign Leave quick launch button
    await page.getByRole('button', { name: 'Assign Leave' }).click();

    // Assert: navigated to Assign Leave page
    await expect(page).toHaveURL(/leave\/assignLeave/);
    await expect(page.getByRole('heading', { name: 'Assign Leave' })).toBeVisible();

    // Navigate back to dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/dashboard\/index/);

    // Click Leave List quick launch button
    await page.getByRole('button', { name: 'Leave List' }).click();

    // Assert: navigated to Leave List page
    await expect(page).toHaveURL(/leave\/viewLeaveList/);
    await expect(page.getByRole('heading', { name: 'Leave List' })).toBeVisible();
  });

  // ── Test 5: My Actions Items Are Visible and Clickable ───────────────────
  test('should show My Actions items and navigate on click', async ({ page }) => {
    await login(page);

    // Assert both action items are visible in the My Actions widget
    await expect(page.getByText('(1) Pending Self Review')).toBeVisible();
    await expect(page.getByText('(1) Candidate to Interview')).toBeVisible();

    // Click Pending Self Review and assert navigation away from dashboard
    await page.getByText('(1) Pending Self Review').click();
    await expect(page).not.toHaveURL(/dashboard\/index/);
  });

});

test.describe('OrangeHRM Dashboard – Negative Scenarios', () => {

  test('should show error when logging in with wrong username and password', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.getByRole('textbox', { name: 'Username' }).fill('wrongUser');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongPassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

});
