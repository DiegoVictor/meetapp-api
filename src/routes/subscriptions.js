import { Router } from 'express';

import SubscriptionController from '../app/controllers/SubscriptionController';
import SubscriptionStore from '../app/validators/SubscriptionStore';

const app = Router();

const subscriptionController = new SubscriptionController();

app.get('/subscriptions', subscriptionController.index);
app.post('/subscriptions', SubscriptionStore, subscriptionController.store);
app.delete('/subscriptions/:id', subscriptionController.delete);

export default app;
