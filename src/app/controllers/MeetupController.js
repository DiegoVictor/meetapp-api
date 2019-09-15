import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const where = {};

    if (req.query.date) {
      const date = parseISO(req.query.date);
      where.date = {
        [Op.between]: [startOfDay(date), endOfDay(date)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: ['id', 'title', 'description', 'localization', 'date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: 10 * (page - 1),
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .min(6)
        .required(),
      description: Yup.string()
        .min(10)
        .required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { date, banner_id } = req.body;

    /**
     * Prevent user to create a meetup without banner
     */
    const banner = await File.findByPk(banner_id);
    if (!banner) {
      return res.status(401).json({
        error: 'The provided banner does not exists',
      });
    }

    /**
     * Check for past dates
     */
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permited',
      });
    }

    return res.json(
      await Meetup.create({
        ...req.body,
        user_id: req.user_id,
      })
    );
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(6),
      description: Yup.string().min(10),
      localization: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { date, banner_id } = req.body;
    const meetup = await Meetup.findOne({
      where: { id: req.params.id, user_id: req.user_id },
    });

    if (!meetup) {
      return res.status(400).json({
        error: 'Meetup does not exists',
      });
    }

    /**
     * Prevent user to create a meetup without banner
     */
    if (banner_id && banner_id !== meetup.banner_id) {
      const banner = await File.findByPk(banner_id);
      if (!banner) {
        return res.status(401).json({
          error: 'The provided banner does not exists',
        });
      }
    }

    /**
     * Check for past dates
     */
    if (date && isBefore(parseISO(date), new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permited',
      });
    }

    return res.json(
      await meetup.update({
        ...req.body,
        user_id: req.user_id,
      })
    );
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({
      where: { id: req.params.id, user_id: req.user_id },
    });

    if (!meetup) {
      return res.status(400).json({
        error: 'Meetup does not exists',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({
        error: "You can't remove past meetups",
      });
    }

    await meetup.destroy();

    return res.json(meetup);
  }
}

export default new MeetupController();
