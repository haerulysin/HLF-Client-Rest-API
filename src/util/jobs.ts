import { ConnectionOptions, Job, Queue, Worker } from "bullmq";
import { Application } from "express";
import { Contract, Transaction } from "fabric-network";
import * as config from "./config";
import { getRetryAction, RetryAction } from "./errors";
import { submitTransaction } from "../fabric";
import { logger } from "./logger";

export type JobData = {
  mspid: string;
  transactionName: string;
  transactionArgs: string[];
  transactionState?: Buffer;
  transactionIds: string[];
};

export type JobResult = {
  transactionPayload?: Buffer;
  transactionError?: string;
};

export type JobSummary = {
  jobId: string;
  transactionIds: string[];
  transactionPayload?: string;
  transactionError?: string;
};

export class JobNotFoundError extends Error {
  jobId: string;

  constructor(message: string, jobId: string) {
    super(message);
    Object.setPrototypeOf(this, JobNotFoundError.prototype);

    this.name = "JobNotFoundError";
    this.jobId = jobId;
  }
}

const connection: ConnectionOptions = {
  port: config.redisPort,
  host: config.redisHost,
  username: config.redisUsername,
  password: config.redisPassword,
};

export const initJobQueue = (): Queue => {
  const submitQueue = new Queue(config.JOB_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: config.submitJobAttempts,
      backoff: {
        type: config.submitJobBackoffType,
        delay: config.submitJobBackoffDelay,
      },
      removeOnComplete: config.maxCompletedSubmitJobs,
      removeOnFail: config.maxFailedSubmitJobs,
    },
  });

  return submitQueue;
};

export const initJobQueueWorker = (app: Application): Worker => {
  const worker = new Worker<JobData, JobResult>(
    config.JOB_QUEUE_NAME,
    async (job): Promise<JobResult> => {
      return await processSubmitTransactionJob(app, job);
    },
    { connection, concurrency: config.submitJobConcurrency }
  );

  worker.on("failed", (job) => {
    logger.warn({ job }, "Job failed");
  });

  // Important: need to handle this error otherwise worker may stop
  // processing jobs
  worker.on("error", (err) => {
    logger.error({ err }, "Worker error");
  });

  if (logger.isLevelEnabled("debug")) {
    worker.on("completed", (job) => {
      logger.debug({ job }, "Job completed");
    });
  }

  return worker;
};

export const addSubmitTransactionJob = async (
  submitQueue: Queue<JobData, JobResult>,
  mspid: string,
  transactionName: string,
  ...transactionArgs: string[]
): Promise<string> => {
  const jobName = `submit ${transactionName} transaction`;
  const job = await submitQueue.add(jobName, {
    mspid,
    transactionName,
    transactionArgs: transactionArgs,
    transactionIds: [],
  });

  if (job?.id === undefined) {
    throw new Error("Submit transaction job ID not available");
  }
  return job.id;
};

export const processSubmitTransactionJob = async (
  app: Application,
  job: Job<JobData, JobResult>
): Promise<JobResult> => {
  const contract = app.locals[job.data.mspid]?.assetContract as Contract;
  if (contract === undefined) {
    logger.error(
      { jobId: job.id, jobName: job.name },
      "Contract not found for MSP ID %s",
      job.data.mspid
    );
    return {
      transactionError: undefined,
      transactionPayload: undefined,
    };
  }
  const args = job.data.transactionArgs;
  let transaction: Transaction;
  if (job.data.transactionState) {
    const savedState = job.data.transactionState;
    transaction = contract.deserializeTransaction(savedState);
  } else {
    transaction = contract.createTransaction(job.data.transactionName);
    await updateJobData(job, transaction);
  }

  try {
    const payload = await submitTransaction(transaction, ...args);
    return {
      transactionError: undefined,
      transactionPayload: payload,
    };
  } catch (err) {
    const retryAction = getRetryAction(err);
    if (retryAction === RetryAction.None) {
      return {
        transactionError: `${err.message}`,
        transactionPayload: undefined,
      };
    }
    if (retryAction === RetryAction.WithNewTransactionId) {
      await updateJobData(job, undefined);
    }
    // Rethrow the error to keep retrying
    throw err;
  }
};

export const updateJobData = async (
  job: Job<JobData, JobResult>,
  transaction: Transaction | undefined
): Promise<void> => {
  const newData = { ...job.data };

  if (transaction != undefined) {
    const transationIds = ([] as string[]).concat(
      newData.transactionIds,
      transaction.getTransactionId()
    );
    newData.transactionIds = transationIds;

    newData.transactionState = transaction.serialize();
  } else {
    newData.transactionState = undefined;
  }

  await job.update(newData);
};

export const getJobSummary = async (
  queue: Queue,
  jobId: string
): Promise<JobSummary> => {
  const job: Job<JobData, JobResult> | undefined = await queue.getJob(jobId);
  if (!(job && job.id != undefined)) {
    throw new JobNotFoundError(`Job ${jobId} not found`, jobId);
  }
  let transactionIds: string[];
  if (job.data && job.data.transactionIds) {
    transactionIds = job.data.transactionIds;
  } else {
    transactionIds = [];
  }
  let transactionError;
  let transactionPayload;
  const returnValue = job.returnvalue;
  if (returnValue) {
    if (returnValue.transactionError) {
      transactionError = returnValue.transactionError;
    }
    if (
      returnValue.transactionPayload &&
      returnValue.transactionPayload['data'].length > 0
    ) {
      const strPayload = Buffer.from(returnValue.transactionPayload['data']).toString();
      transactionPayload = strPayload;
    } else {
      transactionPayload = "";
    }
  }

  const jobSummary: JobSummary = {
    jobId: job.id,
    transactionIds,
    transactionError,
    transactionPayload,
  };
  return jobSummary;
};

export const getJobCounts = async (
  queue: Queue
): Promise<{ [index: string]: number }> => {
  const jobCounts = await queue.getJobCounts(
    "active",
    "completed",
    "delayed",
    "failed",
    "waiting"
  );
  logger.debug({ jobCounts }, "Current job counts");
  return jobCounts;
};


