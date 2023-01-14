import { CustomTypeSM } from "@slicemachine/core/models/CustomType";
import equal from "fast-deep-equal";
import { ModelStatus } from ".";

export type FrontEndCtModel = { local: CustomTypeSM; remote?: CustomTypeSM };

export function compareCustomTypeModels(models: FrontEndCtModel) {
  // If Custom Types are not equals then it was modified locally
  if (!equal(models.local, models.remote)) {
    return ModelStatus.Modified;
  }

  return ModelStatus.Synced;
}
