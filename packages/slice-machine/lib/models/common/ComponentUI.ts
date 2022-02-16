import * as Models from "@slicemachine/core/build/src/models";
import { compareVariations } from "../../utils";
import { BackendEnvironment } from "./Environment";
import PlugginMiddleware from "@slicemachine/plugin-middleware";

export const createScreenshotUrl = (
  baseUrl: string,
  pathToScreenshot: string
): string =>
  `${baseUrl}/api/__preview?q=${encodeURIComponent(
    pathToScreenshot
  )}&uniq=${Math.random()}`;

export const createScreenshotUI = (
  baseUrl: string,
  pathToScreenshot: string
): ScreenshotUI => ({
  path: pathToScreenshot,
  url: createScreenshotUrl(baseUrl, pathToScreenshot),
});

export const buildScreenshotUrls = (
  screenshotPaths:
    | {
        [variationId: string]: Models.Screenshot;
      }
    | undefined,
  baseUrl: string
) => {
  if (!screenshotPaths) {
    return {};
  }
  return Object.entries(screenshotPaths).reduce(
    (acc, [variationId, screenshot]) => {
      return screenshot.path
        ? {
            ...acc,
            [variationId]: createScreenshotUI(baseUrl, screenshot.path),
          }
        : acc;
    },
    {}
  );
};

export enum LibStatus {
  Modified = "MODIFIED",
  Synced = "SYNCED",
  Invalid = "INVALID",
  NewSlice = "NEW_SLICE",
}

export interface ScreenshotUI extends Models.Screenshot {
  url: string;
}

export interface ComponentUI extends Models.Component {
  __status: LibStatus;
  screenshotUrls?: Record<Models.VariationAsObject["id"], ScreenshotUI>;
  snippets: Record<string, Record<string, string>>;
  syntax: string | null;
}

export const ComponentUI = {
  build(
    component: Models.Component,
    remoteSlices: ReadonlyArray<Models.SliceAsObject>,
    env: BackendEnvironment
  ): ComponentUI {
    const plugins = new PlugginMiddleware(env.manifest.plugins, env.cwd);
    const syntax = plugins.getSyntaxForFramework(env.manifest.framework);

    // TODO check that this uses the TYPE_NAME and CUSTOM_NAME properties from the widgets

    const snippets = component.model.variations.reduce((acc, variation) => {
      const value = Object.entries(variation.primary || {}).reduce(
        (acc, [key, value]) => {
          const field = `slice.primary${
            key.includes("-") ? `['${key}']` : `.${key}`
          }`;
          const snippet = plugins.createSnippet(
            env.framework,
            value.type,
            field
          );
          return { ...acc, [key]: snippet };
        },
        {} as Record<string, string>
      );

      return { ...acc, [variation.id]: value };
    }, {} as Record<string, Record<string, string>>);

    return {
      ...component,
      screenshotUrls: buildScreenshotUrls(
        component.infos.screenshotPaths,
        env.baseUrl
      ),
      __status: computeStatus(component, remoteSlices),
      snippets,
      syntax,
    };
  },
};

function computeStatus(
  component: Models.Component,
  remoteSlices: ReadonlyArray<Models.SliceAsObject>
): LibStatus {
  const slice = remoteSlices.find((s) => component.model.id === s.id);
  if (!slice) return LibStatus.NewSlice;

  const sameVersion = !compareVariations(
    component.model.variations,
    slice.variations
  );

  if (sameVersion) return LibStatus.Synced;
  else return LibStatus.Modified;
}
