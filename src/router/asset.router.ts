import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { Contract } from "fabric-network";
import { evaluateTransaction } from "../fabric";
import { Queue } from "bullmq";
import { addSubmitTransactionJob } from "../util/jobs";
import { body, validationResult } from "express-validator";

export const electionRouter = express.Router();
export const ballotRouter = express.Router();
export const assetRouter = express.Router();

electionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`]?.assetContract;
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
    const data = await evaluateTransaction(
      contract,
      "ReadAsset",
      req.params.id
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

ballotRouter.get("/:ballotid", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;
    const data = await evaluateTransaction(
      contract,
      "ReadAsset",
      req.params.ballotid
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

ballotRouter.post(
  "/castvote",
  body().isObject().withMessage("Body must contain an asset object"),
  body("pickedID", "must be a string").notEmpty(),
  body("electionID", "must be a string").notEmpty(),
  async (req: Request, res: Response) => {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      return res.status(400).json({
        status: getReasonPhrase(400),
        reason: "VALIDATION_ERROR",
        message: "invalid request body",
        errors: validation.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const contractName = `${req.user}_Contract`;
    const { pickedID, electionID } = req.body;
    try {
      const submitQueue = req.app.locals.jobq as Queue;
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        contractName,
        "castVote",
        pickedID,
        electionID
      );
      return res.status(202).json({
        status: getReasonPhrase(202),
        jobId: jobId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(err.status).json({
        status: getReasonPhrase(err.status),
        reason: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

assetRouter.get("/", async (req: Request, res: Response) => {
  try {
    const contract: Contract =
      req.app.locals[`${req.user}_Contract`].assetContract;
    const data = await evaluateTransaction(contract, "GetAllAsset");
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
