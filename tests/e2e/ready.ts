import { expect, type Page } from '@playwright/test';

/** Opens a page and waits until app.ts has started every controller. */
export async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-controllers', 'ready');
}
