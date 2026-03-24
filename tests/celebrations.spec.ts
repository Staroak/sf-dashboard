import { test, expect, Page } from '@playwright/test';

// Helper to build a mock dashboard API response
function buildMockData(overrides: {
  dailyApps?: number;
  brokers?: Array<{ userId: string; userName: string; applicationsTaken: number; appraisalsOrdered?: number; submissions?: number }>;
} = {}) {
  const defaultBrokers = [
    { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 0, appraisalsOrdered: 0, submissions: 0, contactsMade: 0, closedWon: 0 },
    { userId: 'u2', userName: 'Gaurav Dadral', applicationsTaken: 0, appraisalsOrdered: 0, submissions: 0, contactsMade: 0, closedWon: 0 },
    { userId: 'u3', userName: 'Nav Cheema', applicationsTaken: 0, appraisalsOrdered: 0, submissions: 0, contactsMade: 0, closedWon: 0 },
    { userId: 'u4', userName: 'Alice Nabi', applicationsTaken: 0, appraisalsOrdered: 0, submissions: 0, contactsMade: 0, closedWon: 0 },
    // Non-broker user (should NOT get celebrations)
    { userId: 'u-admin', userName: 'Admin User', applicationsTaken: 5, appraisalsOrdered: 5, submissions: 5, contactsMade: 0, closedWon: 0 },
  ];

  const brokers = overrides.brokers
    ? overrides.brokers.map(b => ({
        contactsMade: 0, closedWon: 0, appraisalsOrdered: 0, submissions: 0,
        ...b,
      }))
    : defaultBrokers;

  const totalApps = overrides.dailyApps ?? brokers.reduce((sum, b) => sum + b.applicationsTaken, 0);

  const periodData = {
    contactsMade: 0,
    closedWon: 0,
    applicationsTaken: totalApps,
    appraisalsOrdered: 0,
    submissions: 0,
    salesMetrics: {
      contactsMade: 0,
      closedWon: 0,
      applicationsTaken: totalApps,
      appraisalsOrdered: 0,
      submissions: 0,
      byBroker: brokers,
    },
  };

  return {
    timestamp: new Date().toISOString(),
    daily: periodData,
    yesterday: { ...periodData, salesMetrics: { ...periodData.salesMetrics, byBroker: [] } },
    weekly: { ...periodData, salesMetrics: { ...periodData.salesMetrics, byBroker: [] } },
    monthly: { ...periodData, salesMetrics: { ...periodData.salesMetrics, byBroker: [] } },
    leaderboard: [],
  };
}

// Intercept the dashboard API and return mock data
async function mockDashboardAPI(page: Page, data: ReturnType<typeof buildMockData>) {
  await page.route('**/api/dashboard*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  );
}

// Close the celebration overlay by clicking the backdrop (force bypasses animation instability)
async function closeCelebration(page: Page) {
  // Click the close button (X) which is more reliable than the animated text
  const closeBtn = page.locator('[aria-label="Close"], button:has(svg)').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click({ force: true });
  } else {
    // Fallback: click the backdrop overlay
    await page.locator('.fixed.inset-0').first().click({ force: true, position: { x: 10, y: 10 } });
  }
  // Wait for the close animation
  await page.waitForTimeout(600);
}

test.describe('Broker Celebration Notifications', () => {

  test('broker hitting exactly 2/2 apps triggers a celebration', async ({ page }) => {
    const data = buildMockData({
      brokers: [
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 2 },
        { userId: 'u2', userName: 'Gaurav Dadral', applicationsTaken: 1 },
      ],
    });

    await mockDashboardAPI(page, data);
    await page.goto('/');

    // Should see a celebration popup for Harick (2/2 apps)
    const celebration = page.locator('text=HARICK');
    await expect(celebration).toBeVisible({ timeout: 15000 });

    // Should show "HIT THEIR DAILY GOAL!" (exact match, not exceeded)
    await expect(page.locator('text=HIT THEIR DAILY GOAL!')).toBeVisible();
  });

  test('broker exceeding goal (3/2 apps) triggers celebration with exceeded message', async ({ page }) => {
    const data = buildMockData({
      brokers: [
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 3 },
      ],
    });

    await mockDashboardAPI(page, data);
    await page.goto('/');

    const celebration = page.locator('text=HARICK');
    await expect(celebration).toBeVisible({ timeout: 15000 });

    // Should show exceeded message
    await expect(page.locator('text=CRUSHED THEIR DAILY GOAL!')).toBeVisible();
    // Should show the "on fire" message
    await expect(page.locator('text=3 and counting')).toBeVisible();
  });

  test('non-broker users (admin) do NOT trigger celebrations', async ({ page }) => {
    const data = buildMockData({
      brokers: [
        // Admin with 5 apps - should NOT celebrate
        { userId: 'u-admin', userName: 'Admin User', applicationsTaken: 5 },
        // Real broker below goal - should NOT celebrate
        { userId: 'u2', userName: 'Gaurav Dadral', applicationsTaken: 1 },
      ],
    });

    await mockDashboardAPI(page, data);
    await page.goto('/');

    // Wait a bit for any celebrations to potentially fire
    await page.waitForTimeout(5000);

    // No celebration should appear for Admin User
    await expect(page.locator('text=ADMIN')).not.toBeVisible();
    // No celebration overlay should be visible at all
    await expect(page.locator('text=HIT THEIR DAILY GOAL!')).not.toBeVisible();
    await expect(page.locator('text=CRUSHED THEIR DAILY GOAL!')).not.toBeVisible();
  });

  test('multiple real brokers hitting goal get queued celebrations', async ({ page }) => {
    const data = buildMockData({
      brokers: [
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 2 },
        { userId: 'u2', userName: 'Gaurav Dadral', applicationsTaken: 2 },
      ],
    });

    await mockDashboardAPI(page, data);
    await page.goto('/');

    // First celebration should appear (could be either Harick or Gaurav depending on order)
    const firstCelebration = page.locator('text=/HARICK|GAURAV/');
    await expect(firstCelebration).toBeVisible({ timeout: 15000 });

    // Close the first celebration via the backdrop
    await closeCelebration(page);

    // Second celebration should now appear from the queue
    const secondCelebration = page.locator('text=/HARICK|GAURAV/');
    await expect(secondCelebration).toBeVisible({ timeout: 10000 });
  });

  test('broker going from 2/2 to 3/2 triggers a NEW celebration', async ({ page }) => {
    // Start with Harick at 2 apps
    const initialData = buildMockData({
      brokers: [
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 2 },
      ],
    });

    await mockDashboardAPI(page, initialData);
    await page.goto('/');

    // Wait for first celebration
    await expect(page.locator('text=HARICK')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=HIT THEIR DAILY GOAL!')).toBeVisible();

    // Close celebration
    await closeCelebration(page);

    // Now update API to return 3 apps (simulating a data refresh)
    const updatedData = buildMockData({
      brokers: [
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 3 },
      ],
    });

    // Re-mock the API with updated data
    await page.unroute('**/api/dashboard*');
    await mockDashboardAPI(page, updatedData);

    // Wait for the dashboard to poll and pick up the new data (polls every 10s)
    // The new celebration should appear with the exceeded message
    await expect(page.locator('text=CRUSHED THEIR DAILY GOAL!')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=3 and counting')).toBeVisible();
  });

  test('Nav Cheema has higher goal (5) and does not celebrate at 2 apps', async ({ page }) => {
    const data = buildMockData({
      brokers: [
        { userId: 'u3', userName: 'Nav Cheema', applicationsTaken: 2 },
        // Regular broker at 2 should celebrate
        { userId: 'u1', userName: 'Harick Brar', applicationsTaken: 2 },
      ],
    });

    await mockDashboardAPI(page, data);
    await page.goto('/');

    // Harick should get celebrated (goal is 2)
    await expect(page.locator('text=HARICK')).toBeVisible({ timeout: 15000 });

    // Close it
    await closeCelebration(page);

    // Wait to see if Nav gets a celebration (it shouldn't)
    await page.waitForTimeout(3000);

    // Nav should NOT get a celebration popup (goal is 5, only has 2)
    // Check specifically that no celebration overlay appears with Nav's name
    // "NAV" appears in the leaderboard, but the celebration text "HIT THEIR DAILY GOAL" should not reappear
    await expect(page.locator('text=HIT THEIR DAILY GOAL!')).not.toBeVisible();
    await expect(page.locator('text=CRUSHED THEIR DAILY GOAL!')).not.toBeVisible();
  });
});
