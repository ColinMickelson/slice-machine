import { expect } from "@playwright/test";
import { test } from "../fixtures/onboarded";
import { CreateSliceModalPage } from "../pages/slices/createSliceModal.page";
import { SliceDetailsPage } from "../pages/slices/sliceDetails.page";
import { SliceListPage } from "../pages/slices/sliceList.page";

test("As an onboarded user, I can only use Pascal case slice names", async ({
  page,
}) => {
  const sliceListPage = new SliceListPage(page);
  const createSliceModalPage = new CreateSliceModalPage(page);

  await sliceListPage.goto();
  await sliceListPage.openCreateModal();

  await createSliceModalPage.nameInput.type("Invalid Slice Name");
  await expect(createSliceModalPage.submitButton).toBeDisabled();

  await createSliceModalPage.nameInput.clear();
  await createSliceModalPage.nameInput.type("Invalid_slice_name");
  await expect(createSliceModalPage.submitButton).toBeDisabled();

  await createSliceModalPage.nameInput.clear();
  await createSliceModalPage.nameInput.type("123SliceName");
  await expect(createSliceModalPage.submitButton).toBeDisabled();

  await createSliceModalPage.nameInput.clear();
  await createSliceModalPage.nameInput.type("ValidSliceName");
  await expect(createSliceModalPage.submitButton).toBeEnabled();
});

test("As an onboarded user, I can create a new Slice", async ({ page }) => {
  const sliceListPage = new SliceListPage(page);
  const sliceDetailsPage = new SliceDetailsPage(page);
  const createSliceModalPage = new CreateSliceModalPage(page);

  await sliceListPage.goto();
  await sliceListPage.openCreateModal();

  const randomInt = Math.floor(Math.random() * 1e9);
  const sliceName = "Slice" + randomInt;
  await createSliceModalPage.createSlice(sliceName);

  await expect(sliceDetailsPage.title).toBeVisible();
  await expect(sliceDetailsPage.title).toContainText(sliceName);

  await expect(
    sliceDetailsPage.nonRepeatableZone.getByRole("listitem")
  ).toHaveCount(2);
  await expect(
    sliceDetailsPage.repeatableZone.getByRole("listitem")
  ).toHaveCount(0);
});
