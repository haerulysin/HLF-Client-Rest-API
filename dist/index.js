"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const jobs_1 = require("./util/jobs");
let jobQueue;
let jobQueueWorker;
async function main() {
    const app = await (0, server_1.createServer)();
    // // Dev Purpose
    // const wallet = await createWallet(rootadmin);
    // const gateway = await createGateway(wallet, demouser);
    // const network = await getNetwork(gateway);
    // const contract = await getContract(network);
    jobQueue = (0, jobs_1.initJobQueue)();
    jobQueueWorker = (0, jobs_1.initJobQueueWorker)(app);
    app.locals.jobq = jobQueue;
}
main().catch(async (err) => {
    if (jobQueueWorker != undefined) {
        await jobQueue.close();
    }
    if (jobQueue != undefined) {
        await jobQueue.close();
    }
});
//# sourceMappingURL=index.js.map