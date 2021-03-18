import File from '../models/File';
import Meetup from '../models/Meetup';
import MeetupExists from '../services/MeetupExists';

const meetupExists = new MeetupExists();

class ScheduledController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.user_id },
    });
    return res.json(meetups);
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
