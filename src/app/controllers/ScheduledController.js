import File from '../models/File';
import Meetup from '../models/Meetup';
import MeetupExists from '../services/MeetupExists';

const meetupExists = new MeetupExists();

class ScheduledController {
  async index(req, res) {
    const where = { user_id: userId };
    const meetups = await Meetup.findAll({ where });
    const count = await Meetup.count({ where });
    res.header('X-Total-Count', count);
  }

  async show(req, res) {
    const meetup = await Meetup.findOne({
      include: [
        {
          as: 'banner',
          model: File,
        },
      ],
      where: {
        id: req.params.id,
        user_id: req.user_id,
      },
    });
    return res.json(meetup);
  }
}

export default ScheduledController;
