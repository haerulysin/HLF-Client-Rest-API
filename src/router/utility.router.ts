import { Queue } from "bullmq";
import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { getJobSummary, JobNotFoundError } from "../util/jobs.js";
import { getAllBlock, getBlock, getBlockHeight, getTransactionById, getTransactionValidationCode } from "../fabric.js";
import { ContractList } from "../util/types.js";
import { Contract } from "fabric-network";

export const utilityRouter = express.Router();
utilityRouter.get("/jobs/:jobid", async (req: Request, res: Response) => {
  const jobid = req.params.jobid;
  try {
    const submitQueue: Queue = req.app.locals.jobq;
    const jobSummary = await getJobSummary(submitQueue, jobid);
    return res.status(200).json(jobSummary);
  } catch (err) {
    if (err instanceof JobNotFoundError) {
      return res.status(404).json({
        status: getReasonPhrase(404),
        timestamp: new Date().toISOString()
      })
    }
    return res.status(500).json({
      status: getReasonPhrase(500),
      timestamp: new Date().toISOString()
    })
  }
});

utilityRouter.get("/block", async (req: Request, res: Response) => {
  const contract: Contract = (req.app.locals[`${req.user}_Contract`] as ContractList).qsccContract;
  try {

    const blockList = await getAllBlock(contract);
    return res.status(200).json(blockList);
  } catch (e) {

    return res.status(500).json({
      status: getReasonPhrase(500),
      message: e,
      timestamp: new Date().toISOString()
    })
  }
});

utilityRouter.get("/block/:fnType/:fnArgs", async (req: Request, res: Response) => {

  const { fnType, fnArgs } = req.params;
  const contract: Contract = (req.app.locals[`${req.user}_Contract`] as ContractList).qsccContract;
  try {
    const block = await getBlock(contract, fnType, fnArgs);
    return res.status(200).json(block);
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      status: getReasonPhrase(500),
      message: e,
      timestamp: new Date().toISOString()
    })
  }
})

utilityRouter.get("/transaction/:txId", async (req: Request, res: Response) => {

  const { txId } = req.params;
  const contract: Contract = (req.app.locals[`${req.user}_Contract`] as ContractList).qsccContract;
  try {

    const txData = await getTransactionById(contract, txId);
    return res.status(200).json(txData);

  } catch (e) {
    console.log(e)
    return res.status(500).json({
      status: getReasonPhrase(500),
      message: e,
      timestamp: new Date().toISOString()
    })
  }


})