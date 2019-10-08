import jwt from 'jsonwebtoken';
import { badRequest, unauthorized } from '@hapi/boom';

import { SECRET, EXPIRATION_TIME } from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw unauthorized('User not found');
    }

    if (!(await user.checkPassword(password))) {
      throw badRequest('Password does not match');
    }

    const { id, name } = user;
    return res.json({
      token: jwt.sign({ id }, SECRET, {
        expiresIn: EXPIRATION_TIME,
      }),
      user: { id, email, name },
    });
  }
}
export default new SessionController();
