import React from "react";
import {
  Theme,
  Text,
  Card as Themecard,
  Heading,
  Flex,
  Badge,
  type ThemeUIStyleObject,
  type ThemeUICSSObject,
} from "theme-ui";
import { ComponentUI } from "../../common/ComponentUI";
import { Link as LinkUtil } from "../Link";
import { WrapperType, WrapperByType } from "./wrappers";
import { TextWithTooltip } from "@components/Tooltip/TextWithTooltip";
import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { StatusBadge } from "@components/StatusBadge";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { AuthStatus } from "@src/modules/userContext/types";
import { AiOutlineCamera, AiOutlineExclamationCircle } from "react-icons/ai";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { Button } from "@components/Button";

const borderedSx = (sx: ThemeUIStyleObject = {}): ThemeUICSSObject => ({
  bg: "transparent",
  transition: "all 200ms ease-in",
  p: 3,
  position: "relative",
  ...sx,
  "&:hover": {
    transition: "all 200ms ease-out",
    bg: "sidebar",
    border: (t: Theme) => `1px solid ${t.colors?.sidebar as string}`,
  },
});

const defaultSx = (sx: ThemeUIStyleObject = {}): ThemeUICSSObject => ({
  bg: "transparent",
  position: "relative",
  transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
  ...sx,
});

const SliceVariations = ({
  hideVariations,
  variations,
}: {
  hideVariations: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variations: ReadonlyArray<any>;
}) => {
  return !hideVariations ? (
    <>
      {variations ? (
        <Text
          sx={{
            fontSize: 14,
            color: "textClear",
            flexShrink: 0,
            lineHeight: "24px",
          }}
        >
          {variations.length} variation{variations.length > 1 ? "s" : ""}
        </Text>
      ) : null}
    </>
  ) : null;
};

const SliceScreenshotUpdate: React.FC<{
  slice: ComponentUI;
  onUpdateScreenshot: (e: React.MouseEvent) => void;
}> = ({ onUpdateScreenshot }) => (
  <Flex
    mt={1}
    sx={{
      alignItems: "center",
      justifyContent: "space-between",
      padding: 3,
      borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
      mt: 0,
    }}
  >
    <Button
      onClick={onUpdateScreenshot}
      variant="secondarySmall"
      sx={{ fontWeight: "bold" }}
      Icon={AiOutlineCamera}
      iconFill="#1A1523"
      label="Update screenshot"
    />
  </Flex>
);

const SliceDescription = ({
  slice,
  StatusOrCustom,
}: {
  slice: ComponentUI;
  StatusOrCustom:
    | {
        status: ModelStatus;
        authStatus: AuthStatus;
        isOnline: boolean;
      }
    | React.FC<{ slice: ComponentUI }>;
}) => (
  <Flex
    sx={{
      flexDirection: "column",
      padding: 3,
    }}
  >
    <Flex>
      <TextWithTooltip
        text={slice.model.name}
        as="h6"
        sx={{
          fontWeight: "600 !important",
          maxWidth: "80%",
          lineHeight: "24px !important",
        }}
      />
    </Flex>
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <SliceVariations
        variations={slice.model.variations}
        hideVariations={false}
      />
      <Flex sx={{ alignItems: "center" }}>
        {"status" in StatusOrCustom ? (
          <StatusBadge
            modelType="Slice"
            modelId={slice.model.id}
            status={StatusOrCustom.status}
            authStatus={StatusOrCustom.authStatus}
            isOnline={StatusOrCustom.isOnline}
          />
        ) : (
          <StatusOrCustom slice={slice} />
        )}
      </Flex>
    </Flex>
  </Flex>
);

const ScreenshotMissingBanner: React.FC<{ slice: ComponentUI }> = ({
  slice,
}) => {
  const missingScreenshots = countMissingScreenshots(slice);

  if (!missingScreenshots) {
    return null;
  }

  return (
    <Flex
      sx={{
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        bg: "missingScreenshotBanner.bg",
        color: "missingScreenshotBanner.color",
        width: "100%",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "600",
      }}
    >
      <AiOutlineExclamationCircle size={16} style={{ marginRight: "8px" }} />{" "}
      {missingScreenshots}/{slice.model.variations.length} screenshots missing
    </Flex>
  );
};

export const SharedSlice = {
  render({
    showActions,
    slice,
    Wrapper,
    StatusOrCustom,
    wrapperType = WrapperType.clickable,
    onUpdateScreenshot,
    sx,
  }: {
    showActions?: boolean;
    slice: ComponentUI;
    StatusOrCustom:
      | {
          status: ModelStatus;
          authStatus: AuthStatus;
          isOnline: boolean;
        }
      | React.FC<{ slice: ComponentUI }>;
    Wrapper?: React.FC<{
      children?: React.ReactNode;
      link?: { as: string };
      slice: ComponentUI;
      sx?: ThemeUIStyleObject;
    }>;
    wrapperType?: WrapperType;
    onUpdateScreenshot?: (e: React.MouseEvent) => void;
    sx?: ThemeUIStyleObject;
  }) {
    const defaultVariation = ComponentUI.variation(slice);
    if (!defaultVariation) {
      return null;
    }
    const variationId = defaultVariation.id;
    const link = LinkUtil.variation(slice.href, slice.model.name, variationId);

    const CardWrapper = Wrapper || WrapperByType[wrapperType];

    const screenshotUrl = slice?.screenshots?.[variationId]?.url;

    return (
      <CardWrapper
        link={link}
        slice={slice}
        sx={{
          borderColor: (t) => t.colors?.borders,
          "&:focus": {
            borderColor: "bordersFocused",
          },
        }}
      >
        <Themecard
          role="button"
          aria-pressed="false"
          sx={{
            borderColor: "inherit",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "6px",
            overflow: "hidden",
            ...defaultSx(sx),
          }}
        >
          <Flex
            sx={{
              position: "relative",
              flexDirection: "column",
            }}
          >
            <ScreenshotPreview
              src={screenshotUrl}
              sx={{
                height: "198px",
                borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
                borderRadius: "4px 4px 0 0",
              }}
            />
            {showActions ? <ScreenshotMissingBanner slice={slice} /> : null}
            <Flex
              sx={{
                flexDirection: "column",
              }}
            >
              {onUpdateScreenshot ? (
                <SliceScreenshotUpdate
                  slice={slice}
                  onUpdateScreenshot={onUpdateScreenshot}
                />
              ) : null}
              <SliceDescription slice={slice} StatusOrCustom={StatusOrCustom} />
            </Flex>
          </Flex>
        </Themecard>
      </CardWrapper>
    );
  },
};

export const NonSharedSlice = {
  render({
    bordered,
    slice,
    displayStatus,
    thumbnailHeightPx = "290px",
    wrapperType = WrapperType.nonClickable,
    sx,
  }: {
    bordered: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slice: { key: string; value: any };
    displayStatus?: boolean;
    thumbnailHeightPx?: string;
    wrapperType?: WrapperType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sx?: any;
  }) {
    const Wrapper = WrapperByType[wrapperType];

    return (
      <Wrapper link={undefined}>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument */}
        <Themecard sx={bordered ? borderedSx(sx) : defaultSx(sx)}>
          <ScreenshotPreview
            sx={{
              height: thumbnailHeightPx,
              borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
              borderRadius: "4px 4px 0 0",
            }}
          />
          <Flex
            mt={3}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Flex>
              {displayStatus ? (
                <Badge mr={2} variant="modified">
                  Non shared
                </Badge>
              ) : null}
              <Heading sx={{ flex: 1 }} as="h6">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {slice?.value?.fieldset || slice.key}
              </Heading>
            </Flex>
          </Flex>
        </Themecard>
      </Wrapper>
    );
  },
};
