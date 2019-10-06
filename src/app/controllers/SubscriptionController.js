import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, setHours, setMinutes, setSeconds } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';
import Subscription from '../models/Subscription';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionCntroller {
  async index(req, res) {
    const subscriptions = await Meetup.findAll({
      where: {
        date: {
          [Op.gte]: setSeconds(setMinutes(setHours(new Date(), 0), 0), 0),
        },
      },
      attributes: [
        'id',
        'title',
        'description',
        'localization',
        'date',
        'banner_id',
      ],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
        },
        {
          model: Subscription,
          as: 'subscription',
          required: true,
          where: {
            user_id: req.user_id,
          },
          attributes: ['id'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'path'],
        },
      ],
      order: ['date'],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetup_id } = req.body;
    const meetup = await Meetup.findOne({
      where: { id: meetup_id, user_id: { [Op.ne]: req.user_id } },
      include: [
        {
          model: File,
          as: 'banner',
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({
        error: 'Meetup does not exists or is owned by the provided user',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: "You can't subscribe to a past meetup",
      });
    }

    const subscriptions = await Subscription.findAll({
      where: { user_id: req.user_id },
      attributes: ['meetup_id', 'user_id'],
      include: [
        {
          as: 'meetup',
          model: Meetup,
          where: { [Op.or]: [{ id: meetup_id }, { date: meetup.date }] },
          required: true,
        },
      ],
    });

    if (subscriptions.length > 0) {
      return res.status(400).json({
        error:
          'You are already subscribed to this meetup ' +
          'or there is another meetup in the same time',
      });
    }

    const user = await User.findByPk(req.user_id);
    const { user_id } = await Subscription.create({
      user_id: user.id,
      meetup_id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json({ user_id, meetup_id });
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
      return res.status(400).json({
        error: 'Meetup or user does not exists',
      });
    }

    subscription.destroy();
    return res.json(subscription);
  }
}
export default new SubscriptionCntroller();
