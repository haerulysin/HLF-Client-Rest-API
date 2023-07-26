// import { authAPIKey } from "../auth";
import express from "express";
import { authAPIKey } from "../auth.js";
import { electionRouter } from "./election.router.js";
import { authRouter } from "./auth.router.js";
import { ballotRouter } from "./ballot.router.js";
import { utilityRouter } from "./utility.router.js";

export const router = express.Router();

const routeList = [
  {
    path: "/election",
    route: electionRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/ballot",
    route: ballotRouter
  },

  {
    path: "/",
    route: utilityRouter
  },

  
];

for (const r of routeList) {
  if (r.path == "/auth" || r.path == "/jobs") {
    router.use(r.path, r.route);
    continue;
  }
  router.use(r.path, authAPIKey, r.route);
}