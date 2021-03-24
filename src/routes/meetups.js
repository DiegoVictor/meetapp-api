import { Router } from 'express';

import MeetupController from '../app/controllers/MeetupController';
import MeetupStore from '../app/validators/MeetupStore';
import MeetupUpdate from '../app/validators/MeetupUpdate';

const app = new Router();

const meetupController = new MeetupController();

app.get('/meetups', meetupController.index);
app.post('/meetups', MeetupStore, meetupController.store);
app.put('/meetups/:id', MeetupUpdate, meetupController.update);
app.delete('/meetups/:id', meetupController.delete);

export default app;
