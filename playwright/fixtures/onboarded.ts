import { test as base, Page } from "@playwright/test";
import config from "../playwright.config";

// fixture to provide tests with a page containing the localStorage of an onboarded user to disable user guides and tutorials.

type OnboardedFixture = {
  page: Page;
};

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
const onboardedModel = {
  userContext: JSON.stringify({
    hasSendAReview: true,
    isOnboarded: true,
    updatesViewed: { latest: null, latestNonBreaking: null },
    hasSeenTutorialsTooTip: true,
    authStatus: "unknown",
    lastSyncChange: null,
  }),
};
export const test = base.extend<OnboardedFixture>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: config.use?.baseURL || "",
            localStorage: [
              {
                name: "persist:root",
                value: JSON.stringify(onboardedModel),
              },
            ],
          },
        ],
      },
    });
    const page = await context.newPage();

    // Use the fixture value in the test.
    await use(page);

    await page.close();
    await browser.close();
  },
});
export { expect } from "@playwright/test";
