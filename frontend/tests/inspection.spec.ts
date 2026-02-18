import { test, expect } from '@playwright/test';

test('Inspection Workflow: Plan -> Confirm -> Result -> Complete', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // 0. Login
    await test.step('Login', async () => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'CMMS 로그인' })).toBeVisible();
        await page.getByLabel('사번 (ID)').fill('testuser');
        await page.getByLabel('비밀번호').fill('password');
        await page.getByRole('button', { name: '로그인' }).click();
        await expect(page).toHaveURL('/');
    });

    // 1. Navigate to Inspection List
    await test.step('Navigate to Inspection List', async () => {
        await page.goto('/pm/inspection');
        await expect(page).toHaveURL(/\/pm\/inspection/);
        await expect(page.getByRole('heading', { name: /예방점검 관리/ })).toBeVisible();
    });

    // 2. Create New Inspection Plan
    await test.step('Create New Inspection Plan', async () => {
        await page.getByRole('button', { name: '점검 계획 등록' }).click();
        await expect(page).toHaveURL(/\/pm\/inspection\/new/);
        await expect(page.getByRole('heading', { name: /점검 계획 등록/ })).toBeVisible();

        // Fill form
        await page.fill('input[name="name"]', 'E2E Unified Test');
        await page.fill('input[name="equipment_name"]', 'Test Equipment');
        await page.fill('input[name="plan_date"]', new Date().toISOString().split('T')[0]);

        // Add Item
        await page.getByRole('button', { name: '항목 추가' }).click();
        await page.locator('input[placeholder="항목 입력"]').last().fill('Test Item 1');
        await page.locator('input[placeholder="방법 입력"]').last().fill('Visual');
        await page.locator('input[placeholder="기준 입력"]').last().fill('Clean');

        // Confirm Plan
        await page.getByRole('button', { name: '계획 확정' }).click();
        // Expect redirect to list
        await expect(page).toHaveURL(/\/pm\/inspection$/);
    });

    // 3. Start Result Input from List
    await test.step('Start Result Input', async () => {
        // Navigate to List (should already be there)
        await page.goto('/pm/inspection');

        // Click "Plan" tab to see the button
        await page.getByRole('tab', { name: '계획 (Plan)' }).click();

        // Click "Result Input" on the newly created plan
        // We filter by name 'E2E Unified Test'
        const row = page.getByRole('row').filter({ hasText: 'E2E Unified Test' });

        // Click "Result Input" button
        await row.getByRole('button', { name: '실적 입력' }).click();

        // Verify Navigation to Result Page
        await expect(page).toHaveURL(/\/pm\/inspection\/result\/new/);
        await expect(page.getByRole('heading', { name: /점검 실적 등록/ })).toBeVisible();

        // Verify Plan Data Loaded
        await expect(page.locator('input[name="equipment_name"]')).toHaveValue('Test Equipment');
    });

    // 4. Enter Results and Complete
    await test.step('Enter Results and Complete', async () => {
        // Select Result OK
        const selectTrigger = page.locator('button[role="combobox"]').first();
        await selectTrigger.click();
        await page.getByRole('option', { name: '양호' }).click();

        // Complete Inspection
        await page.getByRole('button', { name: '점검 완료' }).click();

        // Expect redirect to list
        await expect(page).toHaveURL(/\/pm\/inspection$/);
    });
});
