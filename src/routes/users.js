import { Router } from 'express';

import auth from '../app/middlewares/auth';
import UserController from '../app/controllers/UserController';
import UserUpdate from '../app/validators/UserUpdate';
import UserStore from '../app/validators/UserStore';

const app = Router();

const userController = new UserController();

app.post('/users', UserStore, userController.store);
app.put('/users', auth, UserUpdate, userController.update);

export default app;
