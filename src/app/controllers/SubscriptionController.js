import { badRequest } from '@hapi/boom';
import { Op } from 'sequelize';
import { setHours, setMinutes, setSeconds } from 'date-fns';

import File from '../models/File';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import User from '../models/User';
import CreateSubscription from '../services/CreateSubscription';
import paginationLinks from '../helpers/paginationLinks';

const createSubscription = new CreateSubscription();

class SubscriptionCntroller {
  async index(req, res) {
    const { currentUrl, userId } = req;
    const { page = 1 } = req.query;
    const limit = 20;
    const where = {
      date: {
        [Op.gte]: setSeconds(setMinutes(setHours(new Date(), 0), 0), 0),
      },
    };

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
            user_id: userId,
          },
        },
        {
          as: 'banner',
          model: File,
        },
      ],
      order: ['date'],
      where,
      limit,
      offset: limit * (page - 1),
    });

    const count = await Meetup.count({ where });
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(paginationLinks(page, pages_total, currentUrl));
    }

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetup_id } = req.body;
    const { userId } = req;

    const subscription = await createSubscription.execute({
      meetup_id,
      userId,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const { id } = req.params;
    const subscription = await Subscription.findOne({
      attributes: ['id'],
      where: {
        meetup_id: id,
        user_id: req.userId,
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
export default SubscriptionCntroller;
