import { badRequest } from '@hapi/boom';

import User from '../models/User';

class EmailAlreadyUsed {
  async run({ email }) {
    const user = await User.findOne({ where: { email } });

    if (user) {
      throw badRequest('Email already in use', { code: 341 });
    }
  }
}

export default new EmailAlreadyUsed();
