import { badRequest, unauthorized } from '@hapi/boom';
import { isBefore, parseISO } from 'date-fns';

import File from '../models/File';

/**
 * Prevent user to create a meetup with banner that not exists and
 * check for past dates
 */
class EditMeetup {
  async run({ data, meetup, user_id }) {
    const { banner_id, date } = data;

    if (banner_id && banner_id !== meetup.banner_id) {
      const banner = await File.findByPk(banner_id);
      if (!banner) {
        throw unauthorized('The provided banner does not exists');
      }
    }

    if (date && isBefore(parseISO(date), new Date())) {
      throw badRequest('Past dates are not permited');
    }

    await meetup.update({ ...data, user_id });
  }
}

export default new EditMeetup();
