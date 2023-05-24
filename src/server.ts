import express, { Application, Express } from "express";
import * as bodyParser from "body-parser";
import cors from 'cors';
import helmet from "helmet";
import { logger } from "./util/logger";
import * as config from "./util/config";
import { router } from "./router/router";
import passport from "passport";
import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import { authAPIKey, fabricAPIKeyStrategy } from "./auth";
import { isMaxmemoryPolicyNoeviction } from "./util/redis";

export async function createServer(): Promise<Application> {
  const app: Express = express();

  //redisCheckMemory
  if (!(await isMaxmemoryPolicyNoeviction())) {
    throw new Error(
      "Invalid redis configuration: redis instance must have the setting maxmemory-policy=noeviction"
    );
  }


  // if (process.env.NODE_ENV === "development") {
  //   app.use(cors());
  // }
  // if (process.env.NODE_ENV === "production") {
  //   // app.use(helmet());
  // }

  app.use(cors())

  //body-parser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //Passport
  passport.use(fabricAPIKeyStrategy);
  app.use(passport.initialize());

  app.use("/api/v1", router);
  app.listen(config.port, () => {
    logger.info(
      `${process.env.NODE_ENV} - RestAPI server started on port http://localhost:${config.port}/api/v1`
    );
  });

  return app;
}
