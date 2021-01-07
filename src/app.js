import 'dotenv/config';
import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

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
export default app;
