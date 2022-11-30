import { Locator, Page } from "@playwright/test";

export class SliceListPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly actionIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole("button", { name: "Create a Slice" }); //create-slice
    this.actionIcon = page.getByTestId("slice-action-icon");
  }

  async goto() {
    await this.page.goto("/slices");
  }

  getSliceCard(name: string): Locator {
    return this.page.locator(`a[href^="/slices/${name}/"]`);
  }

  async clickSliceCard(name: string) {
    // Make sure not to accidentaly click on a button that would trigger another action
    await this.getSliceCard(name).getByRole("heading", { name }).click();
  }

  async openCreateModal() {
    await this.createButton.click();
  }

  async openActionModal(name: string, action: "Rename" | "Delete") {
    await this.getSliceCard(name)
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action)
      .click();
  }

  async openScreenshotModal(name: string) {
    await this.getSliceCard(name).getByRole("button", {
      name: "Update Screenshot",
    });
  }
}
