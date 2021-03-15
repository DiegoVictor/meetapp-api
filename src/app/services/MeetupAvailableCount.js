import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class MeetupAvailableCount {
  async execute({ date, userId }) {
    const where = {};

    if (date) {
      where.date = {
        [Op.between]: [startOfDay(date), endOfDay(date)],
      };
    }

    const subscriptions = await Subscription.findAll({
      attributes: ['id'],
      where: { user_id: userId },
      raw: true,
    });

    where.id = {
      [Op.notIn]: subscriptions.map(({ id }) => id),
    };

    const meetups = await Meetup.count({ where });

    return meetups;
  }
}

export default MeetupAvailableCount;
