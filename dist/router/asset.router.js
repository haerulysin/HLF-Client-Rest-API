"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRouter = exports.ballotRouter = exports.electionRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_1 = require("../fabric");
const jobs_1 = require("../util/jobs");
const express_validator_1 = require("express-validator");
exports.electionRouter = express_1.default.Router();
exports.ballotRouter = express_1.default.Router();
exports.assetRouter = express_1.default.Router();
exports.electionRouter.get("/", async (req, res) => {
    var _a;
    try {
        const contract = (_a = req.app.locals[`${req.user}_Contract`]) === null || _a === void 0 ? void 0 : _a.assetContract;
        const data = await (0, fabric_1.evaluateTransaction)(contract, "GetElectionList");
        let asset = [];
        if (data.length > 0) {
            asset = JSON.parse(data.toString());
        }
        else {
            return res.status(404).json({
                status: (0, http_status_codes_1.getReasonPhrase)(404),
                timestamp: new Date().toISOString(),
            });
        }
        return res.status(200).json(asset);
    }
    catch (err) {
        return res.status(err.status).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.electionRouter.get("/:id", async (req, res) => {
    try {
        const contract = req.app.locals[`${req.user}_Contract`].assetContract;
        const data = await (0, fabric_1.evaluateTransaction)(contract, "ReadAsset", req.params.id);
        return res.status(200).json(JSON.parse(data.toString()));
    }
    catch (err) {
        return res.status(200).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.ballotRouter.get("/:ballotid", async (req, res) => {
    try {
        const contract = req.app.locals[`${req.user}_Contract`].assetContract;
        const data = await (0, fabric_1.evaluateTransaction)(contract, "ReadAsset", req.params.ballotid);
        return res.status(200).json(JSON.parse(data.toString()));
    }
    catch (err) {
        return res.status(200).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.ballotRouter.post("/castvote", (0, express_validator_1.body)().isObject().withMessage("Body must contain an asset object"), (0, express_validator_1.body)("pickedID", "must be a string").notEmpty(), (0, express_validator_1.body)("electionID", "must be a string").notEmpty(), async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({
            status: (0, http_status_codes_1.getReasonPhrase)(400),
            reason: "VALIDATION_ERROR",
            message: "invalid request body",
            errors: validation.array(),
            timestamp: new Date().toISOString(),
        });
    }
    const contractName = `${req.user}_Contract`;
    const { pickedID, electionID } = req.body;
    try {
        const submitQueue = req.app.locals.jobq;
        const jobId = await (0, jobs_1.addSubmitTransactionJob)(submitQueue, contractName, "castVote", pickedID, electionID);
        return res.status(202).json({
            status: (0, http_status_codes_1.getReasonPhrase)(202),
            jobId: jobId,
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        return res.status(err.status).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.assetRouter.get("/", async (req, res) => {
    try {
        const contract = req.app.locals[`${req.user}_Contract`].assetContract;
        const data = await (0, fabric_1.evaluateTransaction)(contract, "GetAllAsset");
        let asset = [];
        if (data.length > 0) {
            asset = JSON.parse(data.toString());
        }
        else {
            return res.status(404).json({
                status: (0, http_status_codes_1.getReasonPhrase)(404),
                timestamp: new Date().toISOString(),
            });
        }
        return res.status(200).json(asset);
    }
    catch (err) {
        return res.status(err.status).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
//# sourceMappingURL=asset.router.js.map