import Meetup from '../models/Meetup';
import MeetupExists from '../services/MeetupExists';

const meetupExists = new MeetupExists();

class ScheduledController {
  async index(req, res) {
    const { currentUrl, userId } = req;

    const where = { user_id: userId };
    const meetups = await Meetup.findAll({ where });
    const count = await Meetup.count({ where });

    res.header('X-Total-Count', count);

    return res.json(
      meetups.map(meetup => ({
        ...meetup.toJSON(),
        url: `${currentUrl}/${meetup.id}`,
      }))
    );
  }

  async show(req, res) {
    const { currentUrl } = req;
    const meetup = await meetupExists.execute({ id: req.params.id });

    const banner = await meetup.getBanner();

    return res.json({
      ...meetup.toJSON(),
      banner,
      url: `${currentUrl}/${meetup.id}`,
    });
  }
}

export default ScheduledController;
