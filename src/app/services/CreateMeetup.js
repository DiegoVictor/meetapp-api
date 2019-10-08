import { isBefore, parseISO } from 'date-fns';
import { badRequest, unauthorized } from '@hapi/boom';

import Meetup from '../models/Meetup';
import File from '../models/File';

/**
 * Prevent user to create a meetup with banner that not exists and
 * check for past dates
 */
class CreateMeetup {
  async run({ data, user_id }) {
    const { banner_id, date } = data;

    const banner = await File.findByPk(banner_id);
    if (!banner) {
      throw unauthorized('The provided banner does not exists');
    }

    if (isBefore(parseISO(date), new Date())) {
      throw badRequest('Past dates are not permited');
    }

    const meetup = await Meetup.create({ ...data, user_id });
    return meetup;
  }
}

export default new CreateMeetup();
