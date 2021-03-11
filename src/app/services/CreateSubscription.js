import { badRequest, unauthorized } from '@hapi/boom';
import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class CreateSubscription {
  async run({ meetup_id, user_id }) {
    const meetup = await Meetup.findOne({
      include: [
        {
          as: 'banner',
          model: File,
        },
      ],
      where: {
        id: meetup_id,
        user_id: { [Op.ne]: user_id },
      },
    });

    if (!meetup) {
      throw badRequest(
        'Meetup does not exists or is owned by the provided user',
        { code: 240 }
      );
    }

    if (isBefore(meetup.date, new Date())) {
      throw unauthorized("You can't subscribe to a past meetup", 'sample', {
        code: 241,
      });
    }

    const subscriptions = await Subscription.findAll({
      include: [
        {
          as: 'meetup',
          model: Meetup,
          required: true,
          where: { [Op.or]: [{ id: meetup_id }, { date: meetup.date }] },
        },
      ],
      where: { user_id },
    });

    if (subscriptions.length > 0) {
      throw unauthorized(
        'You are already subscribed to this meetup ' +
          'or there is another meetup in the same time',
        'sample',
        { code: 242 }
      );
    }

    const subscription = await Subscription.create({ meetup_id, user_id });
    const user = await User.findByPk(user_id);

    await Queue.add(SubscriptionMail.key, { meetup, user });
    return subscription;
  }
}

export default new CreateSubscription();
