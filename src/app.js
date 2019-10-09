import './bootstrap';
import 'express-async-errors';
import cors from 'cors';
import Express from 'express';
import helmet from 'helmet';
import Limit from 'express-rate-limit';
import LimitRedis from 'rate-limit-redis';
import path from 'path';
import redis from 'redis';
import * as Sentry from '@sentry/node';
import Youch from 'youch';

import './database';
import routes from './routes';

class App {
  constructor() {
    this.server = Express();

    if (process.env.LOG) {
      Sentry.init({ dsn: process.env.SENTRY_DSN });
    }

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(helmet());
    this.server.use(
      cors({
        origin: process.env.APP_URL,
      })
    );
    this.server.use(Express.json());
    this.server.use(
      '/files',
      Express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );

    switch (process.env.NODE_ENV) {
      case 'development':
      case 'test':
        break;

      case 'production':
      default:
        this.server.use(
          new Limit({
            max: 100,
            store: new LimitRedis({
              client: redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
              }),
            }),
            windowMs: 1000 * 60 * 15, // 15m
          })
        );
        break;
    }
  }

  routes() {
    this.server.use(routes);
    if (process.env.LOG) {
      this.server.use(Sentry.Handlers.errorHandler());
    }
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      if (process.env.LOG) {
        Sentry.captureException(err);
      }

      const { payload } = err.output;

      if (typeof err.data === 'object') {
        payload.messages = err.data;
        delete payload.message;
      }

      return res.status(payload.statusCode).json(payload);
    });
  }
}

export default new App().server;
