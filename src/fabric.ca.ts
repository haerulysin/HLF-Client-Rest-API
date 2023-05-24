import { handleError, handleFabricCAError } from "./util/errors";
import { logger } from "./util/logger";
// import * as FabricCAServices from 'fabric-ca-client';
import { Wallet } from "fabric-network";
const FabricCAServices = require("fabric-ca-client");

function caConnect() {
  const ccp: Record<string, unknown> = require("./connection/ccp.json");
  const caInfo = ccp.certificateAuthorities["localhost"];
  const cacerts = caInfo.CACerts.pem;
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: cacerts, verify: false },
    null
  );
  return caClient;
}


export async function registerUser(): Promise<any> {
  // const adminIdentity = await wallet.get(adminID);
  // if(!adminIdentity){
  //     logger.info(`Admin ${adminID} not registered or enrolled`);
  // }
  // const caClient = caConnect();
  // const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  // const adminCtx = await provider.getUserContext(adminIdentity,adminID);
  // try{
  //     const register = await caClient.register({
  //         enrollmentID:'rul',
  //         enrollmentSecret:'123',
  //         role: 'client',
  //     }, adminCtx);
  //     return register;
  // }catch(err){
  //     return err;
  // }
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
