import { Router } from 'express';

import SessionController from '../app/controllers/SessionController';
import SessionStore from '../app/validators/SessionStore';

const app = Router();

const sessionController = new SessionController();

app.post('/sessions', SessionStore, sessionController.store);

export default app;
