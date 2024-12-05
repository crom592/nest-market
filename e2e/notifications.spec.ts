import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('shows notification badge with correct count', async ({ page }) => {
    await page.goto('/');
    
    // 알림 뱃지가 표시되는지 확인
    const badge = await page.locator('.badge').first();
    await expect(badge).toBeVisible();
    
    // 뱃지의 숫자가 올바른지 확인
    const count = await badge.textContent();
    expect(Number(count)).toBeGreaterThanOrEqual(0);
  });

  test('opens notification center and displays notifications', async ({ page }) => {
    await page.goto('/');
    
    // 알림 벨 클릭
    await page.click('button[aria-label="알림"]');
    
    // 알림 센터가 표시되는지 확인
    const notificationCenter = await page.locator('.notification-center');
    await expect(notificationCenter).toBeVisible();
    
    // 알림 목록이 표시되는지 확인
    const notifications = await page.locator('.notification-item').all();
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('filters notifications by category', async ({ page }) => {
    await page.goto('/');
    
    // 알림 센터 열기
    await page.click('button[aria-label="알림"]');
    
    // 포인트 탭 클릭
    await page.click('button[role="tab"][name="포인트"]');
    
    // 포인트 관련 알림만 표시되는지 확인
    const notifications = await page.locator('.notification-item');
    for (const notification of await notifications.all()) {
      const category = await notification.getAttribute('data-category');
      expect(category).toBe('POINT');
    }
  });

  test('marks notification as read', async ({ page }) => {
    await page.goto('/');
    
    // 알림 센터 열기
    await page.click('button[aria-label="알림"]');
    
    // 첫 번째 읽지 않은 알림의 읽음 버튼 클릭
    const unreadNotification = await page.locator('.notification-item:not(.read)').first();
    await unreadNotification.locator('button[aria-label="읽음 표시"]').click();
    
    // 알림이 읽음 상태로 변경되었는지 확인
    await expect(unreadNotification).toHaveClass(/read/);
  });

  test('marks all notifications as read', async ({ page }) => {
    await page.goto('/');
    
    // 알림 센터 열기
    await page.click('button[aria-label="알림"]');
    
    // 모두 읽음 버튼 클릭
    await page.click('button:text("모두 읽음")');
    
    // 모든 알림이 읽음 상태로 변경되었는지 확인
    const unreadNotifications = await page.locator('.notification-item:not(.read)').count();
    expect(unreadNotifications).toBe(0);
  });

  test('deletes notification', async ({ page }) => {
    await page.goto('/');
    
    // 알림 센터 열기
    await page.click('button[aria-label="알림"]');
    
    // 알림 개수 확인
    const initialCount = await page.locator('.notification-item').count();
    
    // 첫 번째 알림 삭제
    await page.locator('.notification-item').first().locator('button[aria-label="삭제"]').click();
    
    // 알림이 삭제되었는지 확인
    const finalCount = await page.locator('.notification-item').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('receives real-time notifications', async ({ page }) => {
    await page.goto('/');
    
    // 초기 알림 개수 확인
    const initialCount = await page.locator('.notification-item').count();
    
    // 새로운 알림을 트리거하는 작업 수행 (예: 공구 참여)
    await page.goto('/group-purchases/1');
    await page.click('button:text("참여하기")');
    
    // 새로운 알림이 추가되었는지 확인
    await page.goto('/');
    const finalCount = await page.locator('.notification-item').count();
    expect(finalCount).toBe(initialCount + 1);
  });

  test('shows browser notification', async ({ page }) => {
    await page.goto('/');
    
    // 알림 권한 요청 승인
    await page.evaluate(() => {
      window.Notification.requestPermission = () => Promise.resolve('granted');
    });
    
    // 새로운 알림을 트리거하는 작업 수행
    await page.goto('/group-purchases/1');
    await page.click('button:text("참여하기")');
    
    // 브라우저 알림이 표시되었는지 확인
    const notifications = await page.evaluate(() => {
      return window.Notification['_notifications'];
    });
    expect(notifications.length).toBeGreaterThan(0);
  });

  test('persists notification state after page reload', async ({ page }) => {
    await page.goto('/');
    
    // 알림 센터 열기
    await page.click('button[aria-label="알림"]');
    
    // 첫 번째 알림을 읽음 표시
    const firstNotification = await page.locator('.notification-item').first();
    await firstNotification.locator('button[aria-label="읽음 표시"]').click();
    
    // 페이지 새로고침
    await page.reload();
    
    // 알림 센터 다시 열기
    await page.click('button[aria-label="알림"]');
    
    // 알림 상태가 유지되는지 확인
    const notification = await page.locator('.notification-item').first();
    await expect(notification).toHaveClass(/read/);
  });
});
