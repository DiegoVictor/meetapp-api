import { badRequest, notFound, unauthorized } from '@hapi/boom';
import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

const queue = new Queue();
const subscriptionMail = new SubscriptionMail();

class CreateSubscription {
  async execute({ meetup_id, userId }) {
    const meetup = await Meetup.findOne({
      include: [
        {
          as: 'banner',
          model: File,
        },
      ],
      where: {
        id: meetup_id,
        user_id: { [Op.ne]: userId },
      },
    });

    if (!meetup) {
      throw notFound(
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
      where: { user_id: userId },
    });

    if (subscriptions.length > 0) {
      throw badRequest(
        'You are already subscribed to this meetup ' +
          'or there is another meetup in the same time',
        { code: 242 }
      );
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: userId,
    });
    const user = await User.findByPk(userId);

    await queue.add(subscriptionMail.key, { meetup, user });
    return subscription;
  }
}

export default CreateSubscription;
