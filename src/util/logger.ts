import pino from 'pino';
import * as config from './config.js';

export const logger = pino({
  level: config.loglevel,
});