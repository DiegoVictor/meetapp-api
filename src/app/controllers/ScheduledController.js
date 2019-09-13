import Meetup from '../models/Meetup';
import File from '../models/File';

class ScheduledController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.user_id },
    });
    return res.json(meetups);
  }

  async show(req, res) {
    const meetup = await Meetup.findOne({
      where: { user_id: req.user_id, id: req.params.id },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'path'],
        },
      ],
    });
    return res.json(meetup);
  }
}

export default new ScheduledController();
