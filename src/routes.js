import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import Multer from 'multer';

import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import ScheduledController from './app/controllers/ScheduledController';
import SessionController from './app/controllers/SessionController';
import SubscriptionController from './app/controllers/SubscriptionController';
import UserController from './app/controllers/UserController';

import MeetupStore from './app/validators/MeetupStore';
import MeetupUpdate from './app/validators/MeetupUpdate';
import SessionStore from './app/validators/SessionStore';
import SubscriptionStore from './app/validators/SubscriptionStore';
import UserStore from './app/validators/UserStore';
import UserUpdate from './app/validators/UserUpdate';

import Auth from './app/middlewares/auth';
import storage from './config/storage';

const Route = new Router();
const BruteForce = new Brute(
  new BruteRedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
);

Route.post(
  '/sessions',
  BruteForce.prevent,
  SessionStore,
  SessionController.store
);
Route.post('/users', UserStore, UserController.store);

Route.use(Auth);

Route.post('/files', Multer(storage).single('file'), FileController.store);

Route.get('/meetups', MeetupController.index);
Route.post('/meetups', MeetupStore, MeetupController.store);
Route.put('/meetups/:id', MeetupUpdate, MeetupController.update);
Route.delete('/meetups/:id', MeetupController.delete);

Route.get('/scheduled', ScheduledController.index);
Route.get('/scheduled/:id', ScheduledController.show);

Route.get('/subscriptions', SubscriptionController.index);
Route.post('/subscriptions', SubscriptionStore, SubscriptionController.store);
Route.delete('/subscriptions/:id', SubscriptionController.delete);

Route.put('/users', UserUpdate, UserController.update);

export default Route;
