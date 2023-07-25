// import { authAPIKey } from "../auth";
import { authAPIKey } from "../auth.js";
import { electionRouter, ballotRouter, assetRouter } from "./asset.router.js";
import { authRouter } from "./auth.router.js";
import { jobsRouter } from "./fabric.router.js";
import express from "express";

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
    path: "/asset",
    route: assetRouter,
  },

  {
    path: "/ballot",
    route: ballotRouter,
  },

  {
    path: "/jobs",
    route: jobsRouter
  }
];

for (const r of routeList) {
  if (r.path == "/auth" || r.path == "/jobs") {
    router.use(r.path, r.route);
    continue;
  }
  router.use(r.path, authAPIKey, r.route);
}

router.post("/test", async(req,res) => {
  console.log(req.body);
  res.send(req.body)
})