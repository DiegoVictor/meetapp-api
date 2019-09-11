import 'dotenv/config';
import Express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = Express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(Express.json());
    this.server.use(
      '/files',
      Express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
