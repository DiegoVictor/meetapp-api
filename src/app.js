import 'dotenv/config';
import Express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';

import './database';

class App {
  constructor() {
    this.server = Express();

    if (process.env.LOG) {
      Sentry.init({ dsn: process.env.SENTRY_DSN });
    }

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(Express.json());
    this.server.use(
      '/files',
      Express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    if (process.env.LOG) {
      this.server.use(Sentry.Handlers.errorHandler());
    }
  }
}

export default new App().server;
