import Multer from 'multer';
import { Router } from 'express';

import FileController from '../app/controllers/FileController';
import storage from '../config/storage';

const app = Router();

const fileController = new FileController();

app.post('/files', Multer(storage).single('file'), fileController.store);

export default app;
