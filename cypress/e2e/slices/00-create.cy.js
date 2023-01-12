import path from "path";

import { MANIFEST_FILE, ROOT, SLICE_MOCK_FILE } from "../../consts";

const sliceName = "TestSlice";
const editedSliceName = "EditedSliceName";
const sliceId = "test_slice"; // generated automatically from the slice name
const lib = ".--slices";

describe("Create Slices", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("A user can create and rename a slice", () => {
    cy.createSlice(lib, sliceId, sliceName);

    // add widget
    cy.get("button").contains("Add a new field").click();
    cy.get('[data-cy="Rich Text"]').first().click();
    cy.get('[data-cy="new-field-name-input"]')
      .first()
      .focus()
      .type("Description");
    cy.get('[data-cy="new-field-form"]').first().submit();

    cy.contains("Save to File System").click();

    // remove widget
    cy.get('[data-cy="slice-menu-button"]').first().click();
    cy.contains("Delete field").click();
    cy.get('[data-cy="builder-save-button"]').should("not.be.disabled");

    cy.renameSlice(lib, sliceName, editedSliceName);

    // add a variation

    cy.get("button").contains("Default").click();
    cy.contains("+ Add new variation").click();

    cy.getInputByLabel("Variation name*").type("foo");
    cy.getInputByLabel("Variation ID*").clear();
    cy.getInputByLabel("Variation ID*").type("bar");

    cy.get("#variation-add").submit();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${editedSliceName}/bar`
    );
    cy.get("button").contains("foo").click();
    cy.contains("Default").click();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${editedSliceName}/default`
    );

    cy.contains("Save to File System").click();

    // simulator

    cy.fixture("slice-simulator.jsx", "utf-8").then((file) => {
      const pathToFile = path.join(ROOT, "pages", "slice-simulator.jsx");
      return cy.writeFile(pathToFile, file);
    });

    cy.readFile(MANIFEST_FILE, "utf-8").then((json) => {
      const data = {
        ...json,
        localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
      };
      return cy.writeFile(MANIFEST_FILE, JSON.stringify(data, null, 2));
    });

    // stub window and set target to self
    cy.on("window:before:load", (win) => {
      cy.stub(win, "open").callsFake((url) => {
        return win.open.wrappedMethod.call(win, url, "_self");
      });
    });

    // The Simulator page doesn't fire the `load` event for unknown reasons, but we can fake it.
    cy.window().then((win) => {
      const triggerAutIframeLoad = () => {
        const AUT_IFRAME_SELECTOR = ".aut-iframe";

        // get the application iframe
        const autIframe =
          win.parent.document.querySelector(AUT_IFRAME_SELECTOR);

        if (!autIframe) {
          throw new ReferenceError(
            `Failed to get the application frame using the selector '${AUT_IFRAME_SELECTOR}'`
          );
        }

        autIframe.dispatchEvent(new Event("load"));
        // remove the event listener to prevent it from firing the load event before each next unload (basically before each successive test)
        win.removeEventListener("beforeunload", triggerAutIframeLoad);
      };

      win.addEventListener("beforeunload", triggerAutIframeLoad);
    });

    cy.get("[data-testid=simulator-open-button]").click();

    cy.getInputByLabel("Description").first().clear();
    cy.getInputByLabel("Description").first().type("👋");

    cy.get("[data-cy=save-mock]").click();

    cy.wait(1000);

    cy.get("button").contains("Default").click();
    cy.contains("foo").click();

    cy.wait(1000);

    cy.getInputByLabel("Description").first().clear();
    cy.getInputByLabel("Description").first().type("🎉");

    cy.get("[data-cy=save-mock]").click();

    cy.wait(1000);

    cy.get("button").contains("foo").click();
    cy.contains("Default").click();

    cy.readFile(SLICE_MOCK_FILE(editedSliceName), "utf-8")
      .its(0)
      .its("primary.description.value")
      .its(0)
      .its("content.text")
      .should("equal", "👋");
    cy.readFile(SLICE_MOCK_FILE(editedSliceName), "utf-8")
      .its(1)
      .its("primary.description.value")
      .its(0)
      .its("content.text")
      .should("equal", "🎉");
  });
});
