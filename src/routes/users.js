import { Router } from 'express';

import Auth from '../app/middlewares/Auth';
import UserController from '../app/controllers/UserController';
import UserUpdate from '../app/validators/UserUpdate';
import UserStore from '../app/validators/UserStore';

const app = Router();

const userController = new UserController();

app.post('/users', UserStore, userController.store);
app.put('/users', Auth, UserUpdate, userController.update);

export default app;
