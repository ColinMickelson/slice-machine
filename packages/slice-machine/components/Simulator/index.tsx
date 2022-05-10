import {
  SharedSliceEditor,
  defaultSharedSliceContent,
  themeClass,
} from "@prismicio/editor-fields";
import { renderSliceMock } from "@prismicio/mocks";
import type { SharedSliceContent } from "@prismicio/types-internal/lib/documents/widgets/slices";
import React, { useContext, useEffect, useMemo, useState } from "react";

import { Flex } from "theme-ui";

import { SliceContext } from "@src/models/slice/context";
import { Slices } from "@slicemachine/core/build/models/Slice";

import Header from "./components/Header";
import { Size } from "./components/ScreenSizes";
import IframeRenderer from "./components/IframeRenderer";
import Tracker from "@src/tracker";
import { useSelector } from "react-redux";
import {
  getCurrentVersion,
  getFramework,
  selectSimulatorUrl,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";

export type SliceView = SliceViewItem[];
export type SliceViewItem = Readonly<{ sliceID: string; variationID: string }>;

export default function Simulator() {
  const { Model, variation } = useContext(SliceContext);

  const { framework, version, simulatorUrl } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      simulatorUrl: selectSimulatorUrl(state),
      version: getCurrentVersion(state),
    })
  );

  useEffect(() => {
    void Tracker.get().trackOpenSliceSimulator(framework, version);
  }, []);

  const [state, setState] = useState({ size: Size.FULL });

  const handleScreenSizeChange = (screen: { size: Size }) => {
    setState({ ...state, size: screen.size });
  };

  if (!Model || !variation) {
    return <div />;
  }

  const sliceView = useMemo(
    () => [{ sliceID: Model.model.id, variationID: variation.id }],
    [Model.model.id, variation.id]
  );

  const sharedSlice = useMemo(() => Slices.fromSM(Model.model), [Model.model]);
  const initialContent = useMemo<SharedSliceContent>(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      Model.mock?.find((content) => content.variation === variation.id) ??
      defaultSharedSliceContent(variation.id),
    [Model.mock, variation.id]
  );
  const [content, setContent] = useState(initialContent);
  const [prevVariationId, setPrevVariationId] = useState(variation.id);
  if (variation.id !== prevVariationId) {
    setContent(initialContent);
    setPrevVariationId(variation.id);
  }
  const apiContent = useMemo(
    () =>
      content === initialContent
        ? undefined
        : renderSliceMock(sharedSlice, content),
    [sharedSlice, initialContent, content]
  );

  return (
    <Flex sx={{ flexDirection: "row", height: "100vh" }}>
      <Flex sx={{ flex: 1, flexDirection: "column" }}>
        <Header
          title={Model.model.name}
          Model={Model}
          variation={variation}
          handleScreenSizeChange={handleScreenSizeChange}
          size={state.size}
        />
        <IframeRenderer
          apiContent={apiContent}
          size={state.size}
          simulatorUrl={simulatorUrl}
          sliceView={sliceView}
        />
      </Flex>
      <Flex
        className={themeClass}
        sx={{
          backgroundColor: "#F9F8F9",
          borderInlineStart: "1px solid #DCDBDD",
          flexDirection: "column",
          overflowY: "scroll",
          padding: "72px 24px 36px 23px",
          width: "444px",
        }}
      >
        <SharedSliceEditor
          content={content}
          onContentChange={setContent}
          sharedSlice={sharedSlice}
        />
      </Flex>
    </Flex>
  );
}
