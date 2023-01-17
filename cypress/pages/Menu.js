export class Menu {
  changesNumber(options = {}) {
    return cy.get("[data-cy=changes-number]", options);
  }
  
  navigateTo(label) {
    return cy.get("aside").contains(label).click();
  }
}
