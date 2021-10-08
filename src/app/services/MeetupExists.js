import { notFound } from '@hapi/boom';

import Meetup from '../models/Meetup';

class MeetupExists {
  async execute({ id }) {
    const meetup = await Meetup.findByPk(id);

    if (!meetup) {
      throw notFound('Meetup does not exists', { code: 144 });
    }

    return meetup;
  }
}

export default MeetupExists;
