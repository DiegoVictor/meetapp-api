import { Router } from 'express';

import meetups from './meetups';
import subscriptions from './subscriptions';
import scheduled from './scheduled';
import users from './users';
import files from './files';
import sessions from './sessions';

import Auth from '../app/middlewares/Auth';

const app = new Router();

app.use(sessions);
app.use(users);

app.use(Auth);

app.use(files);
app.use(meetups);
app.use(scheduled);
app.use(subscriptions);

export default app;
