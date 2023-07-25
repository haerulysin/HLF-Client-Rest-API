import { createServer } from "./server.js";
import { Queue } from "bullmq";
import { initJobQueue, initJobQueueWorker } from "./util/jobs.js";
let jobQueue: Queue | undefined;
let jobQueueWorker;

export async function main() {
  const app = await createServer();
  jobQueue = initJobQueue();
  jobQueueWorker = initJobQueueWorker(app);
  app.locals.jobq = jobQueue;

}

// main().catch(async (err) => {
//   if (jobQueueWorker != undefined) {
//     await jobQueue.close();
//   }
//   if (jobQueue != undefined) {
//     await jobQueue.close();
//   }
// });
main();