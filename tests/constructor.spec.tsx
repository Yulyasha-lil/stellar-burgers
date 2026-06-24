import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Мок для ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: '1',
              name: 'Краторная булка N-200i',
              type: 'bun',
              proteins: 80,
              fat: 24,
              calories: 420,
              carbohydrates: 53,
              price: 1255,
              image: 'https://code.s3.yandex.net/react/code/bun-02.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/bun-02-large.png'
            },
            {
              _id: '2',
              name: 'Флюоресцентная булка R2-D3',
              type: 'bun',
              proteins: 44,
              fat: 26,
              calories: 643,
              carbohydrates: 85,
              price: 988,
              image: 'https://code.s3.yandex.net/react/code/bun-01.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/bun-01-large.png'
            },
            {
              _id: '3',
              name: 'Филе Люминесцентного тетраодонтимформа',
              type: 'main',
              proteins: 44,
              fat: 26,
              calories: 643,
              carbohydrates: 85,
              price: 988,
              image: 'https://code.s3.yandex.net/react/code/meat-03.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/meat-03-large.png'
            },
            {
              _id: '4',
              name: 'Соус фирменный Space Sauce',
              type: 'sauce',
              proteins: 50,
              fat: 22,
              calories: 580,
              carbohydrates: 40,
              price: 80,
              image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/sauce-04-large.png'
            }
          ]
        })
      });
    });

    // Мок для данных пользователя
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

    // Мок для создания заказа
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            order: {
              _id: '67890',
              number: 67890,
              name: 'Флюоресцентный бургер',
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

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/соберите бургер/i)).toBeVisible({
      timeout: 10000
    });
  });

  // ТЕСТ 1: Проверка отображения ингредиентов
  test('должен отображать список ингредиентов', async ({ page }) => {
    const items = page.getByTestId('ingredient-item');
    await expect(items.first()).toBeVisible({ timeout: 10000 });
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  // ТЕСТ 2: Открытие модального окна ингредиента
  test('должен открывать модальное окно ингредиента', async ({ page }) => {
    const item = page.getByTestId('ingredient-item').first();
    await item.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Проверяем детали ингредиента
    await expect(page.getByTestId('ingredient-details')).toBeVisible({
      timeout: 5000
    });
  });

  // ТЕСТ 3: Закрытие модалки по крестику
  test('должен закрывать модальное окно по крестику', async ({ page }) => {
    const item = page.getByTestId('ingredient-item').first();
    await item.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();

    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  // ТЕСТ 4: Добавление булки в конструктор
  test('должен добавлять булку в конструктор', async ({ page }) => {
    const bun = page.getByTestId('ingredient-item').first();
    await bun.getByRole('button', { name: 'Добавить' }).click();

    // Используем .first() так как булок две (верх и низ)
    await expect(page.getByTestId('constructor-bun').first()).toBeVisible({
      timeout: 10000
    });
  });

  // ТЕСТ 5: Добавление начинки в конструктор
  test('должен добавлять начинку в конструктор', async ({ page }) => {
    // Начинка - 3-й ингредиент (индексы: 0,1 - булки, 2 - начинка)
    const filling = page.getByTestId('ingredient-item').nth(2);
    await filling.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByTestId('constructor-item')).toBeVisible({
      timeout: 10000
    });
  });

  // ТЕСТ 6: Добавление булки и начинки
  test('должен добавлять булку и начинку в конструктор', async ({ page }) => {
    const bun = page.getByTestId('ingredient-item').first();
    await bun.getByRole('button', { name: 'Добавить' }).click();

    const filling = page.getByTestId('ingredient-item').nth(2);
    await filling.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByTestId('constructor-bun').first()).toBeVisible();
    await expect(page.getByTestId('constructor-item')).toBeVisible();
  });

  // ТЕСТ 7: Создание заказа
  test('должен создавать заказ и отображать номер', async ({
    page,
    context
  }) => {
    // Добавляем куки авторизации
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        domain: '127.0.0.1',
        path: '/'
      }
    ]);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Добавляем булку
    const bun = page.getByTestId('ingredient-item').first();
    await bun.getByRole('button', { name: 'Добавить' }).click();

    // Добавляем начинку
    const filling = page.getByTestId('ingredient-item').nth(2);
    await filling.getByRole('button', { name: 'Добавить' }).click();

    // Оформляем заказ
    await page.getByTestId('order-button').click();

    // Проверяем модальное окно заказа
    const orderModal = page.getByTestId('order-modal');
    await expect(orderModal).toBeVisible({ timeout: 10000 });

    // Проверяем номер заказа
    const orderNumber = page.getByTestId('order-number');
    await expect(orderNumber).toBeVisible();
    await expect(orderNumber).toHaveText('67890');

    // Проверяем, что конструктор пуст
    await expect(page.getByTestId('constructor-bun').first()).not.toBeVisible();
    await expect(page.getByTestId('constructor-item')).not.toBeVisible();

    // Закрываем модалку
    await page.getByTestId('modal-close').click();
    await expect(orderModal).toBeHidden({ timeout: 5000 });
  });

  // ТЕСТ 8: Редирект на логин
  test('должен редиректить на логин без авторизации', async ({ page }) => {
    // Очищаем куки
    await page.context().clearCookies();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Добавляем ингредиент
    const item = page.getByTestId('ingredient-item').first();
    await item.getByRole('button', { name: 'Добавить' }).click();

    // Пытаемся оформить заказ
    await page.getByTestId('order-button').click();

    // Проверяем редирект на логин
    await expect(page).toHaveURL(/\/login/);
  });
});
