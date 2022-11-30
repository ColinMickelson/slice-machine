import { expect, Locator, Page } from "@playwright/test";

export class CreateSliceModalPage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { name: "Create a new slice" });
    this.nameInput = page.getByTestId("slice-name-input");
    this.closeButton = page.getByRole("button", { name: "Close" });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.submitButton = page.getByRole("button", { name: "Create" });
  }

  async createSlice(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }
}
