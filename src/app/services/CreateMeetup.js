import { isBefore } from 'date-fns';
import { badRequest, notFound } from '@hapi/boom';

import Meetup from '../models/Meetup';
import File from '../models/File';

class CreateMeetup {
  async execute({ data, userId }) {
    const { banner_id, date } = data;

    const banner = await File.findByPk(banner_id);
    if (!banner) {
      throw notFound('The provided banner does not exists', {
        code: 141,
      });
    }

    if (isBefore(date, new Date())) {
      throw badRequest('Past dates are not permited', { code: 140 });
    }

    const meetup = await Meetup.create({ ...data, user_id: userId });
    return meetup;
  }
}

export default CreateMeetup;
