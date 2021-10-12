import { Router } from 'express';

import SubscriptionController from '../app/controllers/SubscriptionController';
import MeetupId from '../app/validators/MeetupId';

const app = Router();

const subscriptionController = new SubscriptionController();

app.get('/subscriptions', subscriptionController.index);
app.post('/subscriptions', MeetupId, subscriptionController.store);
app.delete('/subscriptions', MeetupId, subscriptionController.delete);

export default app;
