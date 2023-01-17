import { Builder } from "../Builder";

export class SliceBuilder extends Builder {
  get imagePreview() {
    return cy.get("[alt='Preview image']");
  }

  goTo(sliceLibrary, sliceName) {
    cy.visit(`/${sliceLibrary}/${sliceName}/default`);
    this.saveButton.should("be.visible");
    cy.contains(sliceName).should("be.visible");
    return this;
  }

  openScreenshotModal() {
    cy.contains("Update screenshot").click();
    return this;
  }

  openVariationModal() {
    cy.get("[aria-label='Expand variations']").parent().click();
    cy.contains("Add new variation").click();
    return this;
  }
}
