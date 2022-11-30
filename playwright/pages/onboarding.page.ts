import { expect, Locator, Page } from "@playwright/test";

export class OnboardingPage {
  readonly page: Page;
  readonly welcome: Locator;
  readonly startButton: Locator;
  readonly continueButton: Locator;
  readonly video: Locator;
  readonly skip: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcome = page.getByText("Welcome to Slice Machine");
    this.skip = page.getByTestId("skip-onboarding");
    this.startButton = page.getByRole("button", { name: "Get Started" });
    this.continueButton = page.getByTestId("continue");
    this.video = page.locator("video");
  }

  async goThroughOnboarding() {
    await this.startButton.click();

    const steps = [
      "Build Slices",
      "Create Page Types",
      "Push your pages to Prismic",
    ];

    for (const [index, step] of steps.entries()) {
      await expect(this.video.nth(index)).toBeVisible();
      await expect(
        this.page.getByRole("heading", { name: step })
      ).toBeVisible();
      await this.continueButton.click();
    }

    await expect(this.continueButton).not.toBeVisible();
  }

  async skipOnboarding() {
    await this.startButton.click();
    await this.skip.click();
    await expect(this.startButton).not.toBeVisible();
  }
}
