import { SliceMachineStoreType } from "@src/redux/type";
import equal from "fast-deep-equal";
import { PoolOfFields } from "@src/modules/selectedCustomType/types";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import {
  CustomTypeSM,
  TabSM,
} from "@prismic-beta/slicemachine-core/build/models/CustomType";

// Selectors
export const selectCurrentCustomType = (
  store: SliceMachineStoreType
): CustomTypeSM | null => {
  if (!store.selectedCustomType) return null;
  return store.selectedCustomType.model;
};

export const selectCurrentMockConfig = (
  store: SliceMachineStoreType
): CustomTypeMockConfig | null => {
  if (!store.selectedCustomType) return null;
  return store.selectedCustomType.mockConfig;
};

export const selectCurrentPoolOfFields = (
  store: SliceMachineStoreType
): PoolOfFields => {
  if (!store.selectedCustomType) return [];
  return store.selectedCustomType.model.tabs.reduce<PoolOfFields>(
    (acc: PoolOfFields, curr: TabSM) => {
      return [...acc, ...curr.value];
    },
    []
  );
};

export const isSelectedCustomTypeTouched = (store: SliceMachineStoreType) => {
  if (!store.selectedCustomType) return false;

  return (
    !equal(
      store.selectedCustomType.initialModel,
      store.selectedCustomType.model
    ) ||
    !equal(
      store.selectedCustomType.initialMockConfig,
      store.selectedCustomType.mockConfig
    )
  );
};
