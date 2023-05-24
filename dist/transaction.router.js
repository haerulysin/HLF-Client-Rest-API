"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.txRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } = http_status_codes_1.StatusCodes;
exports.txRouter = express_1.default.Router();
exports.txRouter.get('/getall', async (req, res) => {
    return res.status(OK).json({
        params: req.query,
        status: (0, http_status_codes_1.getReasonPhrase)(OK)
    });
});
//# sourceMappingURL=transaction.router.js.map