import 'dotenv/config';
import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import routes from './routes';
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

export default app;
