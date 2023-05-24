"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobCounts = exports.getJobSummary = exports.updateJobData = exports.processSubmitTransactionJob = exports.addSubmitTransactionJob = exports.initJobQueueWorker = exports.initJobQueue = exports.JobNotFoundError = void 0;
const bullmq_1 = require("bullmq");
const config = __importStar(require("./config"));
const errors_1 = require("./errors");
const fabric_1 = require("../fabric");
const logger_1 = require("./logger");
class JobNotFoundError extends Error {
    constructor(message, jobId) {
        super(message);
        Object.setPrototypeOf(this, JobNotFoundError.prototype);
        this.name = "JobNotFoundError";
        this.jobId = jobId;
    }
}
exports.JobNotFoundError = JobNotFoundError;
const connection = {
    port: config.redisPort,
    host: config.redisHost,
    username: config.redisUsername,
    password: config.redisPassword,
};
const initJobQueue = () => {
    const submitQueue = new bullmq_1.Queue(config.JOB_QUEUE_NAME, {
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
exports.initJobQueue = initJobQueue;
const initJobQueueWorker = (app) => {
    const worker = new bullmq_1.Worker(config.JOB_QUEUE_NAME, async (job) => {
        return await (0, exports.processSubmitTransactionJob)(app, job);
    }, { connection, concurrency: config.submitJobConcurrency });
    worker.on("failed", (job) => {
        logger_1.logger.warn({ job }, "Job failed");
    });
    // Important: need to handle this error otherwise worker may stop
    // processing jobs
    worker.on("error", (err) => {
        logger_1.logger.error({ err }, "Worker error");
    });
    if (logger_1.logger.isLevelEnabled("debug")) {
        worker.on("completed", (job) => {
            logger_1.logger.debug({ job }, "Job completed");
        });
    }
    return worker;
};
exports.initJobQueueWorker = initJobQueueWorker;
const addSubmitTransactionJob = async (submitQueue, mspid, transactionName, ...transactionArgs) => {
    const jobName = `submit ${transactionName} transaction`;
    const job = await submitQueue.add(jobName, {
        mspid,
        transactionName,
        transactionArgs: transactionArgs,
        transactionIds: [],
    });
    if ((job === null || job === void 0 ? void 0 : job.id) === undefined) {
        throw new Error("Submit transaction job ID not available");
    }
    return job.id;
};
exports.addSubmitTransactionJob = addSubmitTransactionJob;
const processSubmitTransactionJob = async (app, job) => {
    var _a;
    const contract = (_a = app.locals[job.data.mspid]) === null || _a === void 0 ? void 0 : _a.assetContract;
    if (contract === undefined) {
        logger_1.logger.error({ jobId: job.id, jobName: job.name }, "Contract not found for MSP ID %s", job.data.mspid);
        return {
            transactionError: undefined,
            transactionPayload: undefined,
        };
    }
    const args = job.data.transactionArgs;
    let transaction;
    if (job.data.transactionState) {
        const savedState = job.data.transactionState;
        transaction = contract.deserializeTransaction(savedState);
    }
    else {
        transaction = contract.createTransaction(job.data.transactionName);
        await (0, exports.updateJobData)(job, transaction);
    }
    try {
        const payload = await (0, fabric_1.submitTransaction)(transaction, ...args);
        return {
            transactionError: undefined,
            transactionPayload: payload,
        };
    }
    catch (err) {
        const retryAction = (0, errors_1.getRetryAction)(err);
        if (retryAction === errors_1.RetryAction.None) {
            return {
                transactionError: `${err.message}`,
                transactionPayload: undefined,
            };
        }
        if (retryAction === errors_1.RetryAction.WithNewTransactionId) {
            await (0, exports.updateJobData)(job, undefined);
        }
        // Rethrow the error to keep retrying
        throw err;
    }
};
exports.processSubmitTransactionJob = processSubmitTransactionJob;
const updateJobData = async (job, transaction) => {
    const newData = Object.assign({}, job.data);
    if (transaction != undefined) {
        const transationIds = [].concat(newData.transactionIds, transaction.getTransactionId());
        newData.transactionIds = transationIds;
        newData.transactionState = transaction.serialize();
    }
    else {
        newData.transactionState = undefined;
    }
    await job.update(newData);
};
exports.updateJobData = updateJobData;
const getJobSummary = async (queue, jobId) => {
    const job = await queue.getJob(jobId);
    if (!(job && job.id != undefined)) {
        throw new JobNotFoundError(`Job ${jobId} not found`, jobId);
    }
    let transactionIds;
    if (job.data && job.data.transactionIds) {
        transactionIds = job.data.transactionIds;
    }
    else {
        transactionIds = [];
    }
    let transactionError;
    let transactionPayload;
    const returnValue = job.returnvalue;
    if (returnValue) {
        if (returnValue.transactionError) {
            transactionError = returnValue.transactionError;
        }
        if (returnValue.transactionPayload &&
            returnValue.transactionPayload['data'].length > 0) {
            const strPayload = Buffer.from(returnValue.transactionPayload['data']).toString();
            transactionPayload = strPayload;
        }
        else {
            transactionPayload = "";
        }
    }
    const jobSummary = {
        jobId: job.id,
        transactionIds,
        transactionError,
        transactionPayload,
    };
    return jobSummary;
};
exports.getJobSummary = getJobSummary;
const getJobCounts = async (queue) => {
    const jobCounts = await queue.getJobCounts("active", "completed", "delayed", "failed", "waiting");
    logger_1.logger.debug({ jobCounts }, "Current job counts");
    return jobCounts;
};
exports.getJobCounts = getJobCounts;
//# sourceMappingURL=jobs.js.map