import { badRequest, unauthorized } from '@hapi/boom';
import { isBefore } from 'date-fns';

import File from '../models/File';

class UpdateMeetup {
  async execute({ data, meetup, userId }) {
    const { banner_id, date } = data;

    if (banner_id && banner_id !== meetup.banner_id) {
      const banner = await File.findByPk(banner_id);
      if (!banner) {
        throw unauthorized('The provided banner does not exists', 'sample', {
          code: 141,
        });
      }
    }

    const now = new Date();
    if (date && isBefore(date, now)) {
      throw badRequest('Past dates are not permited', { code: 140 });
    }

    if (isBefore(meetup.date, now)) {
      throw unauthorized("You can't edit past meetups", 'sample', {
        code: 142,
      });
    }

    await meetup.update({ ...data, user_id: userId });
    return meetup;
  }
}

export default UpdateMeetup;
