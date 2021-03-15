import { extname, resolve } from 'path';
import Crypto from 'crypto';
import Multer from 'multer';

export default {
  storage: Multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (_, file, callback) => {
      Crypto.randomBytes(16, (err, res) => {
        if (err) {
          return callback(err);
        }

        return callback(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
