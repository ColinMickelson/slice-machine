import {
  SharedSlice,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SliceDiff } from "@prismicio/types-internal/lib/customtypes/diff/SharedSlice";
import {
  SharedSliceMockConfig,
  VariationMockConfig,
  SharedSliceMock,
} from "@prismicio/mocks";
import { buildFieldsMockConfig } from "./LegacyMockConfig";
import { ComponentMocks } from "@slicemachine/core/build/models";

function buildVariationMockConfig(
  model: Variation,
  legacyVariationMockConfig?: Partial<Record<string, Record<string, unknown>>>
): VariationMockConfig {
  const primaryFields =
    model.primary &&
    buildFieldsMockConfig(
      model.primary,
      legacyVariationMockConfig?.["primary"]
    );
  const itemFields =
    model.items &&
    buildFieldsMockConfig(model.items, legacyVariationMockConfig?.["items"]);
  return {
    nbItemsBlocks: 1,
    primaryFields,
    itemFields,
  };
}

export function buildSliceMockConfig(
  model: SharedSlice,
  legacyMockConfig: Partial<
    Record<string, Partial<Record<string, Partial<Record<string, unknown>>>>>
  >
): ReadonlyArray<SharedSliceMockConfig> {
  const variationConfigs: Record<string, VariationMockConfig> =
    model.variations.reduce((acc, variationModel) => {
      const variationMockConfig = legacyMockConfig[variationModel.id];
      return {
        ...acc,
        [variationModel.id]: buildVariationMockConfig(
          variationModel,
          variationMockConfig
        ),
      };
    }, {});

  return model.variations.map((v) => {
    return {
      type: "SharedSlice",
      variation: v.id,
      variations: variationConfigs,
    };
  });
}

export default function MockSlice(
  sliceModel: SharedSlice,
  legacyMockConfig: Record<string, Record<string, Record<string, unknown>>>, // not sure about this one.
  previousMocks?: ComponentMocks | null | undefined,
  sliceDiff?: SliceDiff | undefined
): ComponentMocks {
  const sliceMockConfig = buildSliceMockConfig(sliceModel, legacyMockConfig);

  return sliceMockConfig.map((sc) => {
    if (!sliceDiff) return SharedSliceMock.generate(sliceModel, sc);

    const variationMock = previousMocks?.find(
      (m) => m.variation === sc.variation
    );
    if (!variationMock) {
      return SharedSliceMock.generate(sliceModel, sc);
    }

    const patched = SharedSliceMock.patch(
      sliceDiff,
      sliceModel,
      variationMock,
      sc
    );

    if (!patched.ok || !patched.result) {
      // odd case here where patched is false with the error "Error: The model of the content with variation default has not changed.", but here it would be regenerated
      // return SharedSliceMock.generate(sliceModel, sc);
      return variationMock;
    }

    return patched.result;
  });
}
