import { SliceBody, SliceCreateResponse } from "@models/common/Slice";

declare let appRoot: string;

import path from "path";
import { promisify } from "util";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cpy from "copy-template-dir";

import { BackendEnvironment } from "@lib/models/common/Environment";

import getEnv from "../../services/getEnv";
import { snakelize } from "@lib/utils/str";
import Files from "@lib/utils/files";
import { DEFAULT_VARIATION_ID } from "@lib/consts";

import save from "../save";

import { paths, SliceTemplateConfig } from "@lib/models/paths";
import { ApiResult } from "@lib/models/server/ApiResult";
import { RESERVED_SLICE_NAME } from "@lib/consts";

import PluginMiddleWare from "@slicemachine/plugin-middleware";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const copy = promisify(cpy);

const copyTemplate = async (
  env: BackendEnvironment,
  templatePath: string,
  from: string,
  sliceName: string
) => {
  try {
    await copy(templatePath, path.join(env.cwd, from, sliceName), {
      componentName: sliceName,
      componentId: snakelize(sliceName),
      variationId: DEFAULT_VARIATION_ID,
    });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const message = `[create] Could not copy template. Full error: ${e}`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
};

const fromTemplate = async (
  env: BackendEnvironment,
  from: string,
  sliceName: string
) => {
  const templatePath = path.join(appRoot, "templates", "slice", env.framework);
  if (!Files.isDirectory(templatePath)) {
    const message = `[create] Framework "${env.framework}" is not supported. (${templatePath}).`;
    console.error(message);
    return {
      err: new Error(message),
      status: 500,
      reason: message,
    };
  }
  return copyTemplate(env, templatePath, from, sliceName);
};

export default async function createSlice({ sliceName, from }: SliceBody) {
  const { env } = await getEnv();
  const plugins = new PluginMiddleWare(env.manifest.plugins, env.cwd);

  const sliceDir = path.join(env.cwd, from, sliceName);

  // model
  const model = plugins.createModel(sliceName);

  // slices
  const slices = plugins.createSlice(model.data);

  const slicesAndModelToWrite = slices
    .concat({
      filename: model.filename,
      data: JSON.stringify(model.data),
    })
    .map(({ filename, data }) => ({
      filename: path.join(sliceDir, filename),
      data,
    }));

  // story
  const assetsDir = path.join(
    env.cwd,
    ".slicemachine",
    "assets",
    from,
    sliceName
  );
  const pathToSliceFromStory = path.relative(
    path.join(assetsDir, "foo"),
    sliceDir
  );

  const stories = plugins.createStory(
    pathToSliceFromStory,
    sliceName,
    model.data.variations
  );

  const storiesToWrite = stories.map(({ filename, data }) => ({
    filename: path.join(assetsDir, filename),
    data,
  }));

  // TODO: Log things
  // TODO check files don't exist before writing ?

  const filesToWrite = [...slicesAndModelToWrite, ...storiesToWrite];

  filesToWrite.forEach(({ filename, data }) => {
    const dir = path.posix.dirname(filename);
    if (fs.existsSync(dir) === false) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filename, data, "utf-8");
  });

  // mocks and screenshorts ... difficult to unravel

  const body = { sliceName, from, model: model.data, mockConfig: {} };

  const res = await save({ body });

  return {
    ...res,
    variationId: DEFAULT_VARIATION_ID,
  };
}

export async function handler({
  sliceName,
  from,
}: SliceBody): Promise<ApiResult<SliceCreateResponse>> {
  if (RESERVED_SLICE_NAME.includes(sliceName)) {
    const msg = `The slice name '${sliceName}' is reserved for slice machine use`;
    return { err: new Error(msg), status: 400, reason: msg };
  }

  const { env } = await getEnv();
  console.log({ sliceName, from });

  // TODO: wrap this in a test and find out the side effects on the file system

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const pathToModel = paths(env.cwd, "").library(from).slice(sliceName).model();

  const templatePath = SliceTemplateConfig(
    env.cwd /*, pass custom template path here (relative to cwd) */
  );

  if (Files.exists(templatePath) && Files.isDirectory(templatePath)) {
    await copyTemplate(env, templatePath, from, sliceName);
  } else {
    const maybeError = await fromTemplate(env, from, sliceName);
    if (maybeError) {
      return maybeError;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (Files.exists(pathToModel)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const model = Files.readJson(pathToModel);
    const res = await save({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      body: { sliceName, from, model, mockConfig: {} },
    });
    return { ...res, variationId: DEFAULT_VARIATION_ID };
  }

  const msg = `[create] Could not find file model.json. Exiting...`;
  return { err: new Error(msg), status: 500, reason: msg };
}
