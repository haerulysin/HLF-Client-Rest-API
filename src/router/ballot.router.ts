import express, { Request, Response } from "express";
import { getReasonPhrase } from "http-status-codes";
import { Contract} from "fabric-network";
import { evaluateTransaction, getCertCN} from "../fabric.js";
import { Queue } from "bullmq";
import { addSubmitTransactionJob } from "../util/jobs.js";
import { body, validationResult } from "express-validator";
export const ballotRouter = express.Router();

ballotRouter.get('/', async (req: Request, res: Response) => {
    try {
        const contract:Contract = req.app.locals[`${req.user}_Contract`].assetContract;

        const CN = await getCertCN(req.user);
        const query = {selector:{docType:'Ballot', owner:CN}}
        const data = await evaluateTransaction(
            contract,
            'FindAsset',
            JSON.stringify(query)
        );
        return res.status(200).json(JSON.parse(data.toString()))

    }catch (err) {
    return res.status(200).json({
        status: getReasonPhrase(err.status),
        reason: err.message,
        timestamp: new Date().toISOString(),
    });
}
})

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