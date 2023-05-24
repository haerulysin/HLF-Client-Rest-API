/// <reference types="node" />
import { Job, Queue, Worker } from "bullmq";
import { Transaction } from "fabric-network";
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
export declare class JobNotFoundError extends Error {
    jobId: string;
    constructor(message: string, jobId: string);
}
export declare const initJobQueue: () => Queue;
export declare const initJobQueueWorker: (app: Application) => Worker;
export declare const addSubmitTransactionJob: (submitQueue: Queue<JobData, JobResult>, mspid: string, transactionName: string, ...transactionArgs: string[]) => Promise<string>;
export declare const processSubmitTransactionJob: (app: Application, job: Job<JobData, JobResult>) => Promise<JobResult>;
export declare const updateJobData: (job: Job<JobData, JobResult>, transaction: Transaction | undefined) => Promise<void>;
export declare const getJobSummary: (queue: Queue, jobId: string) => Promise<JobSummary>;
export declare const getJobCounts: (queue: Queue) => Promise<{
    [index: string]: number;
}>;
