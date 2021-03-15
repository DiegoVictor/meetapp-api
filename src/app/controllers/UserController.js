import { badRequest } from '@hapi/boom';

import User from '../models/User';
import EmailAlreadyUsed from '../services/EmailAlreadyUsed';

const emailAlreadyUsed = new EmailAlreadyUsed();

class UserController {
  async store(req, res) {
    await emailAlreadyUsed.execute({ email: req.body.email });

    const { id, email, name } = await User.create(req.body);
    return res.json({ id, email, name });
  }

  async update(req, res) {
    const { email, old_password } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      await emailAlreadyUsed.execute({ email });
    }

    if (old_password && !(await user.checkPassword(old_password))) {
      throw badRequest('Password does not match', { code: 340 });
    }

    const { id, name } = await user.update(req.body);

    return res.json({ id, email, name });
  }
}

export default UserController;
