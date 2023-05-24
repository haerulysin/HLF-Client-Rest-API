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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const cors = __importStar(require("cors"));
const logger_1 = require("./util/logger");
const config = __importStar(require("./util/config"));
const router_1 = require("./router/router");
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("./auth");
const redis_1 = require("./util/redis");
async function createServer() {
    const app = (0, express_1.default)();
    //redisCheckMemory
    if (!(await (0, redis_1.isMaxmemoryPolicyNoeviction)())) {
        throw new Error("Invalid redis configuration: redis instance must have the setting maxmemory-policy=noeviction");
    }
    // if (process.env.NODE_ENV === "development") {
    //   app.use(cors());
    // }
    // if (process.env.NODE_ENV === "production") {
    //   // app.use(helmet());
    // }
    app.use(cors({
        allowedHeaders: ["x-api-key", "Content-Type"],
        exposedHeaders: ["x-api-key"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false
    }));
    //body-parser
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    //Passport
    passport_1.default.use(auth_1.fabricAPIKeyStrategy);
    app.use(passport_1.default.initialize());
    app.use("/api/v1", router_1.router);
    app.listen(config.port, () => {
        logger_1.logger.info(`${process.env.NODE_ENV} - RestAPI server started on port http://localhost:${config.port}/api/v1`);
    });
    return app;
}
exports.createServer = createServer;
//# sourceMappingURL=server.js.map