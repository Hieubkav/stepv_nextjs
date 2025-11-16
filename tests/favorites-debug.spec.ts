import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const COURSES_URL = `${BASE_URL}/khoa-hoc`;
const FAVORITES_URL = `${BASE_URL}/khoa-hoc/yeu-thich`;

test('Debug favorites flow - check data persistence', async ({ page }) => {
  // Go to courses page
  await page.goto(COURSES_URL);
  await page.waitForLoadState('networkidle');

  // Check for API calls in the background
  const apiRequests: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes('api')) {
      apiRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  // Find and click heart button
  const heartButtons = page.locator('button[title*="Thêm vào yêu thích"], button[title*="Xóa khỏi yêu thích"]');
  const count = await heartButtons.count();

  if (count === 0) {
    console.log('No heart buttons found');
    return;
  }

  const firstHeart = heartButtons.first();
  const initialTitle = await firstHeart.getAttribute('title');
  console.log(`Initial button title: ${initialTitle}`);

  // Click heart
  await firstHeart.click();
  await page.waitForTimeout(1000);

  const newTitle = await firstHeart.getAttribute('title');
  console.log(`After click button title: ${newTitle}`);

  // Now go to favorites page
  console.log('\nNavigating to favorites page...');
  await page.goto(FAVORITES_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check what's on the page
  const pageTitle = page.locator('h1').first();
  const titleText = await pageTitle.textContent();
  console.log(`Page title: "${titleText}"`);

  // Check for courses
  const courseCards = page.locator('[class*="grid"] > a, [class*="course"]');
  const courseCount = await courseCards.count();
  console.log(`Number of course elements found: ${courseCount}`);

  // Check for login message
  const loginMessage = await page.getByText(/Vui lòng đăng nhập/).isVisible().catch(() => false);
  const emptyMessage = await page.getByText(/Danh sách yêu thích trống/).isVisible().catch(() => false);

  console.log(`\nPage state:`);
  console.log(`  - Login message: ${loginMessage}`);
  console.log(`  - Empty state: ${emptyMessage}`);
  console.log(`  - Courses visible: ${courseCount > 0}`);

  // Log API requests made
  console.log(`\nAPI requests made (${apiRequests.length}):`);
  apiRequests.forEach(req => console.log(`  - ${req}`));

  // Try to inspect the actual page content
  const bodyText = await page.locator('body').textContent();
  const relevantLines = bodyText
    ?.split('\n')
    .filter(line => line.includes('khóa') || line.includes('học') || line.includes('yêu thích') || line.includes('trống'))
    .slice(0, 10);

  console.log(`\nPage content (relevant lines):`);
  relevantLines?.forEach(line => console.log(`  ${line.trim()}`));
});
