import {
  // useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { SharedSliceEditor } from "@prismicio/editor-fields";

import { defaultSharedSliceContent } from "@src/utils/editor";

import { Box, Flex } from "theme-ui";

import Header from "./components/Header";
import IframeRenderer from "./components/IframeRenderer";
import Tracker from "@src/tracking/client";
import { useSelector } from "react-redux";
import {
  getCurrentVersion,
  getFramework,
  selectSimulatorUrl,
} from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentSlice } from "@src/modules/selectedSlice/selectors";
import Router from "next/router";
import ScreenshotPreviewModal from "@components/ScreenshotPreviewModal";
import { Toolbar } from "./components/Toolbar";
import {
  ScreenSizeOptions,
  ScreenSizes,
} from "./components/Toolbar/ScreensizeInput";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { Slices } from "@slicemachine/core/build/models";
import { renderSliceMock } from "@prismicio/mocks";

import { ThemeProvider } from "@prismicio/editor-ui";

import { SharedSliceContent } from "@prismicio/types-internal/lib/content/fields/slices/SharedSliceContent";

// import useThrottle from "@src/hooks/useThrottle";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

const IframeWrapper: React.FC<{
  sharedSlice: SharedSlice;
  screenDimensions: ScreenDimensions;
  editorContent: SharedSliceContent;
  simulatorUrl?: string;
}> = ({ sharedSlice, editorContent, screenDimensions, simulatorUrl }) => {
  const content = renderSliceMock(sharedSlice, editorContent);

  return (
    <IframeRenderer
      apiContent={content}
      screenDimensions={screenDimensions}
      simulatorUrl={simulatorUrl}
    />
  );
};

// With out this too may re-renders are done and things break.
const IframeMemo = memo(IframeWrapper);

export default function Simulator() {
  const { component } = useSelector((store: SliceMachineStoreType) => ({
    component: selectCurrentSlice(
      store,
      Router.query.lib as string, // todo this is already stored
      Router.query.sliceName as string
    ),
  }));

  const { saveSliceMock } = useSliceMachineActions();

  const variation = component?.model.variations.find(
    (variation) => variation.id === (Router.query.variation as string)
  );

  // useSelector called twice, for some reason
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

  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    ScreenSizes[ScreenSizeOptions.DESKTOP]
  );

  if (!component || !variation) {
    // this is a bug
    return <div />;
  }

  const sharedSlice = useMemo(
    () => Slices.fromSM(component.model),
    [component.model]
  );

  const initialContent = useMemo<SharedSliceContent>(
    () =>
      component.mock?.find((m) => m.variation === variation.id) ||
      defaultSharedSliceContent(variation.id),
    [component.mock, variation.id]
  );

  const previousInitialContent = useRef(initialContent);
  const [editorContent, setContent] = useState(initialContent);

  if (previousInitialContent.current !== initialContent) {
    previousInitialContent.current = initialContent;
    setContent(initialContent);
  }

  // const initialApiContent = useMemo(
  //   () =>
  //     renderSliceMock(sharedSlice, editorContent) as {
  //       id: string;
  //       [k: string]: unknown;
  //     },
  //   []
  // );

  // const renderSliceMockCb = useCallback(
  //   () => () => ({
  //     // cast as object because type is unknown
  //     ...(renderSliceMock(sharedSlice, editorContent) as object),
  //     id: initialApiContent.id,
  //   }),
  //   [sharedSlice, editorContent, initialApiContent]
  // );

  // const apiContent = useThrottle(renderSliceMockCb, 800, [
  //   sharedSlice,
  //   editorContent,
  // ]);

  const [isDisplayEditor, toggleIsDisplayEditor] = useState(true);

  return (
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Header
        slice={component}
        variation={variation}
        isDisplayEditor={isDisplayEditor}
        toggleIsDisplayEditor={() => toggleIsDisplayEditor(!isDisplayEditor)}
        onSaveMock={() =>
          saveSliceMock({
            sliceName: component.model.name,
            libraryName: component.from,
            mock: (component.mock || [])
              .filter((mock) => mock.variation !== initialContent.variation)
              .concat(editorContent),
          })
        }
      />
      <Box
        sx={{
          flex: 1,
          bg: "grey01",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex
          sx={{
            flex: 1,
            flexDirection: "row",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Toolbar
              slice={component}
              variation={variation}
              handleScreenSizeChange={setScreenDimensions}
              screenDimensions={screenDimensions}
            />
            <IframeMemo
              sharedSlice={sharedSlice}
              editorContent={editorContent}
              screenDimensions={screenDimensions}
              simulatorUrl={simulatorUrl}
            />
          </Box>
          <Box
            sx={{
              height: "100%",
              overflowY: "scroll",
              ...(isDisplayEditor
                ? {
                    marginLeft: "16px",
                    visibility: "visible",
                    flexShrink: 0,
                    width: "560px",
                  }
                : {
                    marginLeft: "0px",
                    visibility: "hidden",
                    width: "0",
                  }),
              transition: "visibility 0s linear",
            }}
          >
            <ThemeProvider>
              <SharedSliceEditor
                content={editorContent}
                onContentChange={(c) => setContent(c as SharedSliceContent)}
                sharedSlice={sharedSlice}
              />
            </ThemeProvider>
          </Box>
        </Flex>
      </Box>
      {!!component.screenshots[variation.id]?.url && (
        <ScreenshotPreviewModal
          sliceName={Router.router?.query.sliceName as string}
          screenshotUrl={component.screenshots[variation.id]?.url}
        />
      )}
    </Flex>
  );
}
