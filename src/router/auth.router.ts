import express, { Request, Response } from "express";
import { getReasonPhrase } from "http-status-codes";
import { X509Certificate, createHash } from "crypto";
import { body, validationResult } from "express-validator";
import {
  createWallet,
  createGateway,
  getNetwork,
  GetContract,
} from "../fabric.js";
import { enrollUser } from "../fabric.ca.js";

export const authRouter = express.Router();

const testCert = (pub: string, prv: string): any => {
  const deCert = Buffer.from(pub, "base64").toString("ascii");
  try {
    new X509Certificate(deCert);
    return 200;
  } catch (err) {
    return err.message;
  }
};

authRouter.post(
  "/login",
  body().isObject().withMessage("Body must contain an asset object"),
  body("certificate", "must be a string").notEmpty(),
  body("privateKey", "must be a string").notEmpty(),
  async (req: Request, res: Response) => {
    //FORM FIELD VALIDATION
    const validation = validationResult(req);
    const publicCertPem = req.body.certificate;
    const prvKey = req.body.privateKey;

    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: getReasonPhrase(400),
        reason: "VALIDATION_ERROR",
        message: "Invalid request body",
        timestamp: new Date().toISOString(),
        errors: validation.array(),
      });
    }

    const tcert = testCert(publicCertPem, prvKey);
    if (tcert !== 200) {
      return res.status(401).json({
        status: getReasonPhrase(401),
        reason: "Client ECERT wrong format",
        error: tcert,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      const { uid, wallet } = await createWallet(publicCertPem, prvKey);
      const gw = await createGateway(wallet, uid);
      const nw = await getNetwork(gw);
      const cc = await GetContract(nw);
      req.app.locals[`${uid}_Contract`] = cc;
      // const pingCC = await pingChaincode(cc.assetContract);
      return res.status(200).json({
        status: getReasonPhrase(200),
        uid: uid,
        // pingCCData:pingCC,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        status: getReasonPhrase(500),
        reason: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

authRouter.post("/enroll",
  body().isObject().withMessage("Body must contain an asset object"),
  body("voterID", "must be a string").notEmpty(),
  body("voterRegisterID", "must be a string").notEmpty(),
  body("voterName", "must be a string").notEmpty(),
  async (req: Request, res: Response) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: getReasonPhrase(400),
        reason: "VALIDATION_ERROR",
        message: "Invalid request body",
        timestamp: new Date().toISOString(),
        errors: validation.array(),
      });
    }

    try {

      const {voterID, voterName, voterRegisterID} = req.body;

      const data = {
        voterID,
        voterRegisterID,
        voterName,
        docType: "Participant",
      };
      const datahash = createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
      const enroll: any = await enrollUser(datahash);
      const pubCert = Buffer.from(enroll.certificate).toString("base64");
      const prvKey = Buffer.from(enroll.key.toBytes()).toString("base64");
      return res.status(200).json({
        certificate: pubCert,
        privateKey: prvKey,
      });
    } catch (err) {
      return res.status(err.status).json({
        status: getReasonPhrase(err.status),
        reason: err.message,
        timestamp: new Date().toISOString,
      });
    }
  });

// authRouter.get("/ping", async (req: Request, res: Response) => {
//   const ApiKey = req.headers["x-api-key"];
//   const contract: Contract = req.app.locals[`${ApiKey}_Contract`]?.assetContract;

//   if (!contract) {
//     return res.status(400).json({
//       status: getReasonPhrase(400),
//       message: "X-API-KEY Not Available, Try login/enroll first.",
//     });
//   }
//   try {
//     // await pingChaincode(contract);
//     return res.status(200).json({
//       status: getReasonPhrase(200),
//       api_keys: ApiKey
//     })
//   } catch (e) {
//     console.log(e);
//     return res.status(e.status).json({
//       status: getReasonPhrase(e.status),
//       reason: e.message,
//       timestamp: new Date().toISOString(),
//     });
//   }
// });