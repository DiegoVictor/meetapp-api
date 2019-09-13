import { Router } from 'express';
import Multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import ScheduledController from './app/controllers/ScheduledController';
import storage from './config/storage';
import Auth from './app/middlewares/auth';

const Route = new Router();

Route.post('/sessions', SessionController.store);
Route.post('/users', UserController.store);

Route.use(Auth);

Route.put('/users', UserController.update);
Route.post('/files', Multer(storage).single('file'), FileController.store);

Route.get('/scheduled', ScheduledController.index);
Route.get('/scheduled/:id', ScheduledController.show);

Route.get('/meetups', MeetupController.index);
Route.post('/meetups', MeetupController.store);
Route.put('/meetups/:id', MeetupController.update);
Route.delete('/meetups/:id', MeetupController.delete);

Route.get('/subscriptions', SubscriptionController.index);
Route.post('/subscriptions', SubscriptionController.store);

export default Route;
