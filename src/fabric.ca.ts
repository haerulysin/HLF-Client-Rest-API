import { handleFabricCAError } from "./util/errors.js";
import FabricCAServices from 'fabric-ca-client';

import ccp from './connection/ccp.json' assert {type:'json'}

function caConnect() {
  const caInfo = ccp.certificateAuthorities["localhost"];
  const cacerts = [caInfo.CACerts.pem];
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: cacerts, verify: false },
    null
  );
  return caClient;
}

export async function enrollUser(userID: string): Promise<object> {
  try {
    const caClient = caConnect();
    const enrollment = await caClient.enroll({
      enrollmentID: userID,
      enrollmentSecret: userID,
    });
    return enrollment;
  } catch (err) {
    throw handleFabricCAError(err);
  }
}

