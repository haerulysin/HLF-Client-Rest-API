"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollUser = exports.registerUser = void 0;
const errors_1 = require("./util/errors");
const FabricCAServices = require("fabric-ca-client");
function caConnect() {
    const ccp = require("./connection/ccp.json");
    const caInfo = ccp.certificateAuthorities["localhost"];
    const cacerts = caInfo.CACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: cacerts, verify: false }, null);
    return caClient;
}
async function registerUser() {
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
exports.registerUser = registerUser;
async function enrollUser(userID) {
    try {
        const caClient = caConnect();
        const enrollment = await caClient.enroll({
            enrollmentID: userID,
            enrollmentSecret: userID,
        });
        return enrollment;
    }
    catch (err) {
        throw (0, errors_1.handleFabricCAError)(err);
    }
}
exports.enrollUser = enrollUser;
//# sourceMappingURL=fabric.ca.js.map