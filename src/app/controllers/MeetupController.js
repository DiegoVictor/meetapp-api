import { isBefore, parseISO } from 'date-fns';
import { unauthorized } from '@hapi/boom';

import CreateMeetup from '../services/CreateMeetup';
import UpdateMeetup from '../services/UpdateMeetup';
import MeetupAvailable from '../services/MeetupAvailable';
import MeetupExists from '../services/MeetupExists';

const meetupExists = new MeetupExists();
const updateMeetup = new UpdateMeetup();
class MeetupController {
  async index(req, res) {
    const { date, page } = req.query;
    const meetups = await MeetupAvailable.run({
      date: date ? parseISO(date) : null,
      page,
      user_id: req.user_id,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const { user_id, body: data } = req;
    const meetup = await CreateMeetup.run({ data, user_id });

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await updateMeetup.execute({
      data: req.body,
      meetup: await MeetupExists.run({ id: req.params.id }),
      user_id: req.user_id,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await meetupExists.execute({
      id: req.params.id,
    });

    if (isBefore(meetup.date, new Date())) {
      throw unauthorized("You can't remove past meetups", 'sample', {
        code: 143,
      });
    }

    await meetup.destroy();

    return res.json(meetup);
  }
}

export default MeetupController;
