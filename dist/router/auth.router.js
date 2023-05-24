"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const fabric_ca_1 = require("../fabric.ca");
const crypto_1 = require("crypto");
const express_validator_1 = require("express-validator");
const fabric_1 = require("../fabric");
exports.authRouter = express_1.default.Router();
const testCert = (pub, prv) => {
    const deCert = Buffer.from(pub, "base64").toString("ascii");
    try {
        new crypto_1.X509Certificate(deCert);
        return 200;
    }
    catch (err) {
        return err.message;
    }
};
exports.authRouter.post("/login", (0, express_validator_1.body)().isObject().withMessage("Body must contain an asset object"), (0, express_validator_1.body)("certificate", "must be a string").notEmpty(), (0, express_validator_1.body)("privateKey", "must be a string").notEmpty(), async (req, res) => {
    //FORM FIELD VALIDATION
    const validation = (0, express_validator_1.validationResult)(req);
    const publicCertPem = req.body.certificate;
    const prvKey = req.body.privateKey;
    if (!validation.isEmpty()) {
        return res.status(400).json({
            status: (0, http_status_codes_1.getReasonPhrase)(400),
            reason: "VALIDATION_ERROR",
            message: "Invalid request body",
            timestamp: new Date().toISOString(),
            errors: validation.array(),
        });
    }
    const tcert = testCert(publicCertPem, prvKey);
    if (tcert !== 200) {
        return res.status(401).json({
            status: (0, http_status_codes_1.getReasonPhrase)(401),
            reason: "Client ECERT wrong format",
            error: tcert,
            timestamp: new Date().toISOString(),
        });
    }
    try {
        const { uid, wallet } = await (0, fabric_1.createWallet)(publicCertPem, prvKey);
        const gw = await (0, fabric_1.createGateway)(wallet, uid);
        const nw = await (0, fabric_1.getNetwork)(gw);
        const cc = await (0, fabric_1.GetContract)(nw);
        req.app.locals[`${uid}_Contract`] = cc;
        return res.status(200).json({
            status: (0, http_status_codes_1.getReasonPhrase)(200),
            uid: uid,
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(500).json({
            status: (0, http_status_codes_1.getReasonPhrase)(500),
            reason: err.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.authRouter.post("/register", async (req, res) => {
    //ENROLL REGISTERED IDENTITIES
    const data = Object.assign(Object.assign({}, req.body), { docType: "Participant" });
    const datahash = (0, crypto_1.createHash)("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
    try {
        const enroll = await (0, fabric_ca_1.enrollUser)(datahash);
        const pubCert = Buffer.from(enroll.certificate).toString("base64");
        const prvKey = Buffer.from(enroll.key.toBytes()).toString("base64");
        return res.status(200).json({
            certificate: pubCert,
            privateKey: prvKey,
        });
    }
    catch (err) {
        return res.status(err.status).json({
            status: (0, http_status_codes_1.getReasonPhrase)(err.status),
            reason: err.message,
            timestamp: new Date().toISOString,
        });
    }
});
//# sourceMappingURL=auth.router.js.map