import express, { Request, Response } from "express";
import { getReasonPhrase } from "http-status-codes";
import { Contract } from "fabric-network";
import { evaluateTransaction } from "../fabric.js";

export const electionRouter = express.Router();
electionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract = req.app.locals[`${req.user}_Contract`]?.assetContract;
    const data = await evaluateTransaction(contract, "GetElectionList");
    let asset = [];
    if (data.length > 0) {
      asset = JSON.parse(data.toString());
    } else {
      return res.status(404).json({
        status: getReasonPhrase(404),
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(200).json(asset);
  } catch (err) {
    return res.status(err.status).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

electionRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;

    const query = {selector:{docType:'Election', electionID: req.params.id}}
    const data = await evaluateTransaction(
      contract,
      "FindAsset",
      JSON.stringify(query)
    );
    return res.status(200).json(JSON.parse(data.toString()));
  } catch (err) {
    return res.status(200).json({
      status: getReasonPhrase(err.status),
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
