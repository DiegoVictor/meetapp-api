import { unauthorized } from '@hapi/boom';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import { SECRET } from '../../config/auth';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw unauthorized('Token not provided');
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, SECRET);
    req.user_id = decoded.id;
  } catch (err) {
    throw unauthorized('Token invalid');
  }

  return next();
};
