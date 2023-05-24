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
exports.submitJobQueueScheduler = exports.maxFailedSubmitJobs = exports.maxCompletedSubmitJobs = exports.submitJobConcurrency = exports.submitJobAttempts = exports.submitJobBackoffDelay = exports.submitJobBackoffType = exports.redisPassword = exports.redisUsername = exports.redisHost = exports.redisPort = exports.fabricCAHostname = exports.fabricAdminPw = exports.fabricAdminUser = exports.chaincodeName = exports.channelName = exports.asLocalhost = exports.port = exports.loglevel = exports.JOB_QUEUE_NAME = exports.MSPID = exports.ORG = void 0;
require("dotenv").config();
const env = __importStar(require("env-var"));
exports.ORG = env.get("ORG_NAME").default("SampleOrg").asString();
exports.MSPID = env.get("MSP_ID").default("SampleOrg").asString();
exports.JOB_QUEUE_NAME = "submitContract";
exports.loglevel = env
    .get("LOG_LEVEL")
    .default("info")
    .asEnum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);
exports.port = env
    .get("PORT")
    .default("3000")
    .example("3000")
    .asPortNumber();
exports.asLocalhost = env
    .get("AS_LOCAL_HOST")
    .default("true")
    .example("true")
    .asBoolStrict();
exports.channelName = env
    .get("HLF_CHANNEL_NAME")
    .default("ch1")
    .asString();
exports.chaincodeName = env
    .get("HLF_CHAINCODE_NAME")
    .default("mycc")
    .example("evote")
    .asString();
//Fabric-CA Config
exports.fabricAdminUser = env
    .get("HLF_CA_ADMIN_USER")
    .default("admin")
    .asString();
exports.fabricAdminPw = env
    .get("HLF_CA_ADMIN_PW")
    .default("adminpw")
    .asString();
exports.fabricCAHostname = env
    .get("HLF_CA_HOSTNAME")
    .default("http://localhost:7054")
    .asString();
//REDIS
exports.redisPort = env.get("REDIS_PORT").default("6379").asPortNumber();
exports.redisHost = env
    .get("REDIS_HOST")
    .default("localhost")
    .asString();
exports.redisUsername = env
    .get("REDIS_USERNAME")
    .default("default")
    .asString();
exports.redisPassword = env
    .get("REDIS_PASSWORD")
    .default("12345678")
    .asString();
exports.submitJobBackoffType = env
    .get("SUBMIT_JOB_BACKOFF_TYPE")
    .default("fixed")
    .asEnum(["fixed", "exponential"]);
exports.submitJobBackoffDelay = env
    .get("SUBMIT_JOB_BACKOFF_DELAY")
    .default("3000")
    .example("3000")
    .asIntPositive();
exports.submitJobAttempts = env
    .get("SUBMIT_JOB_ATTEMPTS")
    .default("5")
    .example("5")
    .asIntPositive();
exports.submitJobConcurrency = env
    .get("SUBMIT_JOB_CONCURRENCY")
    .default("5")
    .example("5")
    .asIntPositive();
exports.maxCompletedSubmitJobs = env
    .get("MAX_COMPLETED_SUBMIT_JOBS")
    .default("1000")
    .example("1000")
    .asIntPositive();
exports.maxFailedSubmitJobs = env
    .get("MAX_FAILED_SUBMIT_JOBS")
    .default("1000")
    .example("1000")
    .asIntPositive();
exports.submitJobQueueScheduler = env
    .get("SUBMIT_JOB_QUEUE_SCHEDULER")
    .default("true")
    .example("true")
    .asBoolStrict();
//# sourceMappingURL=config.js.map