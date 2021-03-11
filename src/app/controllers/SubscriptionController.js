import { badRequest } from '@hapi/boom';
import { Op } from 'sequelize';
import { setHours, setMinutes, setSeconds } from 'date-fns';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import CreateSubscription from '../services/CreateSubscription';

class SubscriptionCntroller {
  async index(req, res) {
    const subscriptions = await Meetup.findAll({
      include: [
        {
          as: 'organizer',
          model: User,
        },
        {
          as: 'subscription',
          model: Subscription,
          required: true,
          where: {
            user_id: req.user_id,
          },
        },
        {
          as: 'banner',
          model: File,
        },
      ],
      order: ['date'],
      where: {
        date: {
          [Op.gte]: setSeconds(setMinutes(setHours(new Date(), 0), 0), 0),
        },
      },
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetup_id } = req.body;
    const { user_id } = req;
    const subscription = await CreateSubscription.run({ meetup_id, user_id });

    return res.json(subscription);
  }

  async delete(req, res) {
    const { id } = req.params;
    const subscription = await Subscription.findOne({
      attributes: ['id'],
      where: {
        meetup_id: id,
        user_id: req.user_id,
      },
    });

    if (!subscription) {
      throw badRequest('Meetup or user does not exists', {
        code: 244,
      });
    }

    subscription.destroy();
    return res.json(subscription);
  }
}
export default new SubscriptionCntroller();
