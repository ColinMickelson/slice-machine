import { Builder } from "../Builder";

export class SliceBuilder extends Builder {
  get imagePreview() {
    return cy.get("[alt='Preview image']");
  }

  get renameButton() {
    return cy.get('[data-cy="edit-slice-name"]');
  }

  get headerSliceNameAndVariation() {
    return cy.get('[data-cy="slice-and-variation-name-header"]');
  }

  get staticZone() {
    return cy.get("[data-cy=slice-non-repeatable-zone]");
  }

  get addStaticFieldButton() {
    return cy.get('[data-cy=add-Static-field]');
  }

  get repeatableZone() {
    return cy.get("[data-cy=slice-repeatable-zone]");
  }

  get addRepeatableFieldButton() {
    return cy.get('[data-cy=add-Repeatable-field]');
  }

  get variationsDropdown() {
    return cy.get("[aria-label='Expand variations']");
  }

  get addVariationButton() {
    return cy.contains("button", "Add new variation");
  }

  goTo(sliceLibrary, sliceName, variation = 'default') {
    cy.visit(`/${sliceLibrary}/${sliceName}/${variation}`);
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
