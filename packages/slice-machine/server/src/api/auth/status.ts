import { CheckAuthStatusResponse } from "../../../../lib/models/common/Auth";
import { RequestWithEnv } from "../http/common";
import { getAndSetUserProfile } from "../services/getAndSetUserProfile";
import { PrismicSharedConfigManager } from "@prismic-beta/slicemachine-core/build/prismic";

export default async function handler(
  req: RequestWithEnv
): Promise<CheckAuthStatusResponse> {
  try {
    const authToken = PrismicSharedConfigManager.getAuth();
    if (!Boolean(authToken)) {
      return { status: "pending" };
    }

    const profile = await getAndSetUserProfile(req.env.client);

    return {
      status: "ok",
      shortId: profile.shortId,
      intercomHash: profile.intercomHash,
    };
  } catch (e) {
    console.error(e);
    return { status: "error" };
  }
}
