import { Queue } from "bullmq";
import express, { Request, Response } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { getJobSummary, JobNotFoundError } from "../util/jobs";

export const jobsRouter = express.Router();
jobsRouter.get("/:jobid", async (req: Request, res: Response) => {
  const jobid = req.params.jobid;

  try {
    const submitQueue: Queue = req.app.locals.jobq;
    const jobSummary = await getJobSummary(submitQueue, jobid);
    return res.status(200).json(jobSummary);
  } catch (err) {
    if(err instanceof JobNotFoundError){
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
