import { isBefore, parseISO } from 'date-fns';
import { unauthorized } from '@hapi/boom';

import CreateMeetup from '../services/CreateMeetup';
import UpdateMeetup from '../services/UpdateMeetup';
import MeetupAvailable from '../services/MeetupAvailable';
import MeetupExists from '../services/MeetupExists';
import paginationLinks from '../helpers/paginationLinks';

const meetupExists = new MeetupExists();
const createMeetup = new CreateMeetup();
const updateMeetup = new UpdateMeetup();
class MeetupController {
  async index(req, res) {
    const { currentUrl, userId } = req;
    const { date, page } = req.query;
    const limit = 20;

    const meetups = await meetupAvailable.execute({
      date: date ? parseISO(date) : null,
      page,
      limit,
      userId,
    });

    const count = await meetupAvailableCount.execute({
      date: date ? parseISO(date) : null,
      userId,
    });
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(paginationLinks(page, pages_total, currentUrl));
    }

    return res.json(
      meetups.map(meetup => {
        return {
          ...meetup.toJSON(),
          url: `${currentUrl}/${meetup.id}`,
        };
      })
    );
  }

  async store(req, res) {
    const { userId, body: data } = req;
    const meetup = await createMeetup.execute({ data, userId });

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await updateMeetup.execute({
      data: req.body,
      meetup: await meetupExists.execute({ id: req.params.id }),
      userId: req.userId,
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
