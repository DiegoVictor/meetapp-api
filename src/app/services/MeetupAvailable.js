import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';

/**
 * Get meetups that user have not subscribed to
 */
class MeetupAvailable {
  async run({ date, page = 1, user_id }) {
    const where = {};

    if (date) {
      where.date = {
        [Op.between]: [startOfDay(date), endOfDay(date)],
      };
    }

    const subscriptions = await Subscription.findAll({
      attributes: ['id'],
      where: { user_id },
      raw: true,
    });

    where.id = {
      [Op.notIn]: subscriptions,
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
      limit: 10,
      offset: 10 * (page - 1),
      order: ['title', 'date'],
      where,
    });

    return meetups;
  }
}

export default new MeetupAvailable();
