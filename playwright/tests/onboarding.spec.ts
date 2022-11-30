import { test, expect } from "@playwright/test";
import { MenuPage } from "../pages/menu.page";
import { OnboardingPage } from "../pages/onboarding.page";

test("As a new user, I go through the whole onboarding", async ({ page }) => {
  const onboardingPage = new OnboardingPage(page);
  const menu = new MenuPage(page);

  await page.goto("/");

  await onboardingPage.isLoaded();
  await expect(menu.AppHeader).not.toBeVisible();

  await expect(page).toHaveScreenshot({ fullPage: true });
  await onboardingPage.goThroughOnboarding();
  await expect(menu.AppHeader).toBeVisible();

  await page.reload();
  await expect(menu.AppHeader).toBeVisible();
  // Depending on the number of chars in the SM version, the menu was taking more or less width making the screenshot comparison fail.
  // await expect(page).toHaveScreenshot({fullPage: true, mask: [menu.appVersion, page.locator("video")]});
});

test("As a new user, I can skip the onboarding", async ({ page }) => {
  const onboardingPage = new OnboardingPage(page);
  const menu = new MenuPage(page);

  await page.goto("/");

  await onboardingPage.isLoaded();
  await expect(menu.AppHeader).not.toBeVisible();

  await onboardingPage.skipOnboarding();
  await expect(menu.AppHeader).toBeVisible();

  await page.reload();
  await expect(menu.AppHeader).toBeVisible();
});
