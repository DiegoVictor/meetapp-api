import jwt from 'jsonwebtoken';

import { EXPIRATION_TIME, SECRET } from '../../src/config/auth';

export default id => {
  return jwt.sign({ id }, SECRET, {
    expiresIn: EXPIRATION_TIME,
  });
};
