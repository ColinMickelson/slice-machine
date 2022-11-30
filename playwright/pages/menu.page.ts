import { expect, Locator, Page } from "@playwright/test";

export class MenuPage {
  readonly page: Page;
  readonly AppHeader: Locator;
  readonly customTypesLink: Locator;
  readonly slicesLink: Locator;
  readonly changesLink: Locator;
  readonly tutorialLink: Locator;
  readonly changelogLink: Locator;
  readonly appVersion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.AppHeader = page.locator("h5", { hasText: "Slice Machine" });
    this.customTypesLink = page.locator("nav a", { hasText: "Custom Types" });
    this.slicesLink = page.locator("nav a", { hasText: "Slices" });
    this.changesLink = page.locator("nav a", { hasText: "Changes" });
    this.tutorialLink = page.locator("a", { hasText: "Video tutorials" });
    this.changelogLink = page.locator("a", { hasText: "Changelog" });
    this.appVersion = page.locator('a[href="/changelog"] > div:nth-child(2)');
  }

  async gotoCustomTypes() {
    await this.customTypesLink.click();
    await expect(
      this.page.locator("main a", { hasText: "Custom Types" })
    ).toBeVisible();
  }

  async gotoSlices() {
    await this.slicesLink.click();
    await expect(
      this.page.locator("main a", { hasText: "Slices" }).first()
    ).toBeVisible();
  }

  async gotoChanges() {
    await this.changesLink.click();
    await expect(
      this.page.locator("main a", { hasText: "Changes" })
    ).toBeVisible();
  }

  async gotoChangelog() {
    await this.changelogLink.click();
    await expect(this.page.getByText("All versions")).toBeVisible();
  }
}
