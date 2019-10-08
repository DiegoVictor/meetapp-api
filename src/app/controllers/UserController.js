import User from '../models/User';

class UserController {
  async store(req, res) {
    const user_exists = await User.findOne({
      where: { email: req.body.email },
    });

    const { id, email, name } = await User.create(req.body);
    return res.json({ id, email, name });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const { email, old_password } = req.body;
    const user = await User.findByPk(req.user_id);

    if (email !== user.email) {
      const user_exists = await User.findOne({ where: { email } });
      if (user_exists) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }
    }

    if (old_password && !(await user.checkPassword(old_password))) {
      throw badRequest('Password does not match');
    }

    const { id, name } = await user.update(req.body);
    return res.json({ id, email, name });
  }
}

export default new UserController();
