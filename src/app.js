import 'dotenv/config';
import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';

import routes from './routes';
import RouteAliases from './app/middlewares/RouteAliases';
import database from './database';

database();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  '/files',
  express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
);

app.use(RouteAliases);
app.use('/v1', routes);

app.use(errors());
app.use(async (err, _, res, next) => {
  if (isBoom(err)) {
    const { statusCode, payload } = err.output;

    return res.status(statusCode).json({
      ...payload,
      ...err.data,
      docs: process.env.DOCS_URL,
    });
  }

  return next(err);
});

export default app;
