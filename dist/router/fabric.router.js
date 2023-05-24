"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const jobs_1 = require("../util/jobs");
exports.jobsRouter = express_1.default.Router();
exports.jobsRouter.get("/:jobid", async (req, res) => {
    const jobid = req.params.jobid;
    try {
        const submitQueue = req.app.locals.jobq;
        const jobSummary = await (0, jobs_1.getJobSummary)(submitQueue, jobid);
        return res.status(200).json(jobSummary);
    }
    catch (err) {
        if (err instanceof jobs_1.JobNotFoundError) {
            return res.status(404).json({
                status: (0, http_status_codes_1.getReasonPhrase)(404),
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            status: (0, http_status_codes_1.getReasonPhrase)(500),
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=fabric.router.js.map