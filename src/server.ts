import express, { Application, Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from 'cors';
// import helmet from "helmet";
import { logger } from "./util/logger.js";
import * as config from "./util/config.js";
import { router } from "./router/router.js";
import passport from "passport";
import { fabricAPIKeyStrategy } from "./auth.js";
import { isMaxmemoryPolicyNoeviction } from "./util/redis.js";
import helmet from "helmet";

export async function createServer(): Promise<Application> {
  const app: Express = express();

  if (!(await isMaxmemoryPolicyNoeviction())) {
    throw new Error(
      "Invalid redis configuration: redis instance must have the setting maxmemory-policy=noeviction"
    );
  }
  if (process.env.NODE_ENV === 'development') {
    app.use(cors())
  }else{
    app.use(helmet());
  }
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  passport.use(fabricAPIKeyStrategy);
  app.use(passport.initialize());
  app.use("/api/v1", router);
  // app.use("/", (req: Request, res: Response) => { res.send("RestAPI for Evote Chaincode") })
  app.listen(config.port, () => {
    logger.info(
      `${process.env.NODE_ENV} - RestAPI server started on port http://localhost:${config.port}`
    );
  });

  return app;
}