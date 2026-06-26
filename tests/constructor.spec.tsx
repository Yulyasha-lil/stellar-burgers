import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        domain: '127.0.0.1',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.routeFromHAR('tests/hars/api.har', {
      url: '**/api/**',
      notFound: 'abort'
    });

    await page.goto('/');

    await expect(
      page.getByTestId('ingredient-item').first()
    ).toBeVisible();
  });
  // Тест 1
  test('должен отображать список ингредиентов', async ({ page }) => {
    const items = page.getByTestId('ingredient-item');

    await expect(items.first()).toBeVisible();

    expect(await items.count()).toBeGreaterThan(0);
  });

  // Тест 2
  test('должен открывать модальное окно ингредиента', async ({ page }) => {
    const ingredient = page.getByTestId('ingredient-item').first();

    const ingredientName = (
      await ingredient.locator('p.text_type_main-default').textContent()
    )?.trim();

    await ingredient.click();

    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();

    await expect(
      page.getByTestId('ingredient-details')
    ).toBeVisible();

    await expect(
      page
        .getByTestId('ingredient-details')
        .getByRole('heading')
    ).toHaveText(ingredientName ?? '');
  });

  // Тест 3
  test('должен закрывать модальное окно по крестику', async ({ page }) => {
    const item = page.getByTestId('ingredient-item').first();
    await item.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();

    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  // Тест 4
  test('должен добавлять булку в конструктор', async ({ page }) => {
    const bun = page.getByTestId('ingredient-item').first();

    await bun.getByRole('button', { name: 'Добавить' }).click();

    await expect(
      page.getByTestId('constructor-bun').first()
    ).toBeVisible();
  });

  // Тест 5
  test('должен добавлять выбранную начинку в конструктор', async ({
    page
  }) => {
    const bun = page.getByTestId('ingredient-item').first();

    await bun.getByRole('button', { name: 'Добавить' }).click();

    const filling = page.getByTestId('ingredient-item').nth(2);

    const fillingName = (
      await filling.locator('p.text_type_main-default').textContent()
    )?.trim();

    await filling
      .getByRole('button', { name: 'Добавить' })
      .click();

    const constructor = page.getByTestId(
      'constructor-ingredients'
    );

    await expect(constructor).toContainText(fillingName ?? '');
  });

  // Тест 6
  test('должен добавлять булку и начинку', async ({ page }) => {
    await page
      .getByTestId('ingredient-item')
      .first()
      .getByRole('button', { name: 'Добавить' })
      .click();

    await page
      .getByTestId('ingredient-item')
      .nth(2)
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(
      page.getByTestId('constructor-bun').first()
    ).toBeVisible();

    await expect(
      page.getByTestId('constructor-item')
    ).toBeVisible();
  });

  // Тест 7
  test('должен создавать заказ и отображать номер', async ({
    page,
    context
  }) => {
    // 1. Авторизация
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        domain: '127.0.0.1',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    // 2. Мокаем проверку пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@user.com',
            name: 'Test User'
          }
        })
      });
    });

    // 3. Мокаем создание заказа
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            order: {
              _id: 'test-order-id',
              number: 107162,
              name: 'Флюоресцентный люминесцентный бургер',
              status: 'done',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ingredients: ['1', '2', '1']
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 4. Переходим на страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 5. Проверяем, что пользователь авторизован
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 5000 });

    // 6. Добавляем булку
    const bun = page.getByTestId('ingredient-item').first();
    await bun.getByRole('button', { name: 'Добавить' }).click();

    // 7. Добавляем начинку
    const filling = page.getByTestId('ingredient-item').nth(2);
    await filling.getByRole('button', { name: 'Добавить' }).click();

    // 8. Оформляем заказ
    await page.getByTestId('order-button').click();

    // 9. Проверяем модальное окно заказа
    const orderModal = page.getByTestId('order-modal');
    await expect(orderModal).toBeVisible({ timeout: 10000 });

    // 10. Проверяем номер заказа
    const orderNumber = page.getByTestId('order-number');
    await expect(orderNumber).toBeVisible();
    await expect(orderNumber).toHaveText('107162');

    // 11. Проверяем, что конструктор пуст
    await expect(page.getByTestId('constructor-bun').first()).not.toBeVisible();
    await expect(page.getByTestId('constructor-item')).not.toBeVisible();

    // 12. Закрываем модалку
    await page.getByTestId('modal-close').click();
    await expect(orderModal).toBeHidden({ timeout: 5000 });
  });
  
   // Тест 8
  test('должен переводить на страницу логина без авторизации', async ({
    page,
    context
  }) => {
    await context.clearCookies();

    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.reload();

    await page
      .getByTestId('ingredient-item')
      .first()
      .getByRole('button', { name: 'Добавить' })
      .click();

    await page.getByTestId('order-button').click();

    await expect(page).toHaveURL(/login/);
  });
});
