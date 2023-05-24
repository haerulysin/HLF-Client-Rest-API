"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// import { authAPIKey } from "../auth";
const auth_1 = require("../auth");
const asset_router_1 = require("./asset.router");
const auth_router_1 = require("./auth.router");
const fabric_router_1 = require("./fabric.router");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
const routeList = [
    {
        path: "/election",
        route: asset_router_1.electionRouter,
    },
    {
        path: "/auth",
        route: auth_router_1.authRouter,
    },
    {
        path: "/asset",
        route: asset_router_1.assetRouter,
    },
    {
        path: "/ballot",
        route: asset_router_1.ballotRouter,
    },
    {
        path: "/jobs",
        route: fabric_router_1.jobsRouter
    }
];
for (const r of routeList) {
    if (r.path == "/auth" || r.path == "/jobs") {
        exports.router.use(r.path, r.route);
        continue;
    }
    exports.router.use(r.path, auth_1.authAPIKey, r.route);
}
//# sourceMappingURL=router.js.map