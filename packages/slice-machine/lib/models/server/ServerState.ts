import ServerError from "./ServerError";
import { FrontEndEnvironment } from "../common/Environment";
import { LibraryUI } from "../common/LibraryUI";
import { SliceSM } from "@core/models";
import { CustomTypeSM } from "@core/models/CustomType";
import ErrorWithStatus from "../common/ErrorWithStatus";

export interface ConfigErrors {
  [errorKey: string]: ServerError;
}

export default interface ServerState {
  env: FrontEndEnvironment;
  libraries: ReadonlyArray<LibraryUI>;
  customTypes: ReadonlyArray<CustomTypeSM>;
  remoteCustomTypes: ReadonlyArray<CustomTypeSM>;
  remoteSlices: ReadonlyArray<SliceSM>;
  clientError?: ErrorWithStatus;
}
