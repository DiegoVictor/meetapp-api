import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';

class MeetupAvailable {
  async execute({ date, page = 1, limit, userId }) {
    const where = {};

    if (date) {
      where.date = {
        [Op.between]: [startOfDay(date), endOfDay(date)],
      };
    }

    const subscriptions = await Subscription.findAll({
      attributes: ['id', 'user_id', 'meetup_id'],
      where: { user_id: userId },
      raw: true,
    });

    where.id = {
      [Op.notIn]: subscriptions.map(({ meetup_id }) => meetup_id),
    };

    const meetups = await Meetup.findAll({
      include: [
        {
          as: 'organizer',
          model: User,
        },
        {
          as: 'banner',
          model: File,
        },
      ],
      limit,
      offset: limit * (page - 1),
      order: ['title', 'date'],
      where,
    });

    return meetups;
  }
}

export default MeetupAvailable;
