import Meetup from '../models/Meetup';

class ScheduledController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.user_id },
    });
    return res.json(meetups);
  }
}

export default new ScheduledController();
