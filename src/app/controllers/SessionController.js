import jwt from 'jsonwebtoken';
import { badRequest, unauthorized } from '@hapi/boom';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw unauthorized('User not found', 'sample', { code: 444 });
    }

    if (!(await user.checkPassword(password))) {
      throw badRequest('Password does not match', { code: 440 });
    }

    const { id, name } = user;
    return res.json({
      token: jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }),
      user: { id, email, name },
    });
  }
}
export default SessionController;
