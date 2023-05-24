"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAPIKey = exports.fabricAPIKeyStrategy = void 0;
const passport_1 = __importDefault(require("passport"));
const http_status_codes_1 = require("http-status-codes");
const passport_headerapikey_1 = require("passport-headerapikey");
exports.fabricAPIKeyStrategy = new passport_headerapikey_1.HeaderAPIKeyStrategy({ header: "x-api-key", prefix: "" }, true, function (apiKey, done, req) {
    if (!req.app.locals[`${apiKey}_Contract`]) {
        return done(null, false);
    }
    else {
        return done(null, apiKey);
    }
});
const authAPIKey = (req, res, next) => {
    passport_1.default.authenticate("headerapikey", { session: false }, (err, user, _info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json({
                status: (0, http_status_codes_1.getReasonPhrase)(401),
                reason: "NOT_AUTHENTICATED",
                timestamp: new Date().toISOString(),
            });
        req.logIn(user, { session: false }, async (err) => {
            if (err) {
                return next(err);
            }
            return next();
        });
    })(req, res, next);
};
exports.authAPIKey = authAPIKey;
//# sourceMappingURL=auth.js.map