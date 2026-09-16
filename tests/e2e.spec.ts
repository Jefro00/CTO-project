import { test, expect } from '@playwright/test';

test.describe('AUTOMOTIVE OS — E2E Role Workflow & Error Hunter Suite', () => {
  const accounts = {
    owner: { email: 'owner@example.local', pass: 'Password123!', role: 'OWNER' },
    manager: { email: 'manager@example.local', pass: 'Password123!', role: 'BRANCH_MANAGER' },
    advisor: { email: 'advisor@example.local', pass: 'Password123!', role: 'SERVICE_ADVISOR' },
    mechanic: { email: 'mechanic@example.local', pass: 'Password123!', role: 'MECHANIC' },
    documents: { email: 'documents@example.local', pass: 'Password123!', role: 'DOCUMENT_MANAGER' },
    viewer: { email: 'viewer@example.local', pass: 'Password123!', role: 'VIEWER' },
  };

  test('Scenario 1: Service Advisor (advisor@example.local) — Check-in & Work Order Creation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', accounts.advisor.email);
    await page.fill('input[type="password"]', accounts.advisor.pass);
    await page.click('button[type="submit"]');

    // 2. Dashboard loaded
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Главный экран СТО')).toBeVisible();

    // 3. New Inspection Wizard
    await page.goto('/inspections/new');
    await expect(page.locator('text=Новая приемка автомобиля')).toBeVisible();

    // Step 1: Client & Vehicle
    await page.click('text=Начать осмотр (Шаг 2)');

    // Step 2: Checklist
    await page.click('text=Фото и дефекты (Шаг 3)');

    // Step 3: Damage marking
    await page.click('text=Итог приемки (Шаг 4)');

    // Step 4: Finish inspection and create order
    await page.click('text=Завершить приемку и создать заказ');

    // Should redirect to work-orders/:id
    await page.waitForURL(/\/work-orders\/.+/);
    await expect(page.locator('text=Работы и запасные части')).toBeVisible();

    // Ensure no fatal React/runtime crashes
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('Scenario 2: Mechanic (mechanic@example.local) — Workshop Queue & Completion', async ({ page }) => {
    // 1. Login as Mechanic
    await page.goto('/login');
    await page.fill('input[type="email"]', accounts.mechanic.email);
    await page.fill('input[type="password"]', accounts.mechanic.pass);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 2. Work Orders Page
    await page.goto('/work-orders');
    await expect(page.locator('text=Заказ-наряды')).toBeVisible();

    // Check my assigned tab
    await page.click('text=Мои заказы (Цех)');
    await expect(page.locator('text=BMW X5')).toBeVisible();

    // 3. Tasks Page
    await page.goto('/tasks');
    await expect(page.locator('text=Задачи и поручения цеха')).toBeVisible();
  });

  test('Scenario 3: Owner (owner@example.local) — Reports, Backups & Settings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', accounts.owner.email);
    await page.fill('input[type="password"]', accounts.owner.pass);
    await page.click('button[type="submit"]');

    // Reports
    await page.goto('/reports');
    await expect(page.locator('text=Аналитика и статистика')).toBeVisible();

    // Users Settings
    await page.goto('/settings/users');
    await expect(page.locator('text=Управление сотрудниками')).toBeVisible();

    // Roles Matrix
    await page.goto('/settings/roles');
    await expect(page.locator('text=Матрица прав доступа')).toBeVisible();

    // Locations & Backups
    await page.goto('/settings/locations');
    await expect(page.locator('text=Резервные копии')).toBeVisible();
  });

  test('Scenario 4: Viewer (viewer@example.local) — Read-only verification', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', accounts.viewer.email);
    await page.fill('input[type="password"]', accounts.viewer.pass);
    await page.click('button[type="submit"]');

    await page.goto('/vehicles');
    await expect(page.locator('text=Автомобили')).toBeVisible();

    // Open vehicle timeline
    const firstVeh = page.locator('a[href^="/vehicles/"]').first();
    await firstVeh.click();
    await expect(page.locator('text=VIN')).toBeVisible();
  });
});
