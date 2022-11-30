import { expect, Locator, Page } from "@playwright/test";

export class SliceDetailsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly saveButton: Locator;

  readonly addFieldButton: Locator;
  readonly addRepeatableFieldButton: Locator;
  readonly nonRepeatableZone: Locator;
  readonly repeatableZone: Locator;
  readonly showSnippetsButton: Locator;
  readonly hideSnippetsButton: Locator;
  readonly toggleSnippetsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.getByTestId("slice-and-variation-name-header");
    this.saveButton = page.getByRole("button", { name: "Save to File System" });

    this.showSnippetsButton = page.getByRole("button", {
      name: "Show code snippets",
    });
    this.hideSnippetsButton = page.getByRole("button", {
      name: "Hide code snippets",
    });

    this.nonRepeatableZone = page.getByTestId("slice-non-repeatable-zone");
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");

    this.addFieldButton = this.page
      .getByRole("button", { name: "Add a new field" })
      .nth(0);

    this.addRepeatableFieldButton = this.page
      .getByRole("button", { name: "Add a new field" })
      .nth(1);
  }
}
