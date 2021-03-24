import { Router } from 'express';

import ScheduledController from '../app/controllers/ScheduledController';

const app = Router();

const scheduledController = new ScheduledController();

app.get('/scheduled', scheduledController.index);
app.get('/scheduled/:id', scheduledController.show);

export default app;
