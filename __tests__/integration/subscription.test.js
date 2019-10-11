import request from 'supertest';
import jwt from 'jsonwebtoken';
import { isBefore, parseISO } from 'date-fns';
import app from '../../src/app';
import User from '../../src/app/models/User';
import { SECRET, EXPIRATION_TIME } from '../../src/config/auth';
import Meetup from '../../src/app/models/Meetup';
import Subscription from '../../src/app/models/Subscription';

describe('Scheduled', () => {
  let token;
  let meetup_id;
  let past_meetup_id;
  let other_meetup_id;
  let user_id;

  beforeAll(async () => {
    const user = await User.create({
      name: 'user',
      email: 'user8@test.com',
      password: '123456',
    });
    user_id = user.id;

    token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: EXPIRATION_TIME,
    });

    const other_user = await User.create({
      name: 'user',
      email: 'user9@test.com',
      password: '123456',
    });

    const date = new Date();
    date.setDate(date.getDate() + 1);

    const meetup = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #15`,
      user_id: other_user.id,
    });
    meetup_id = meetup.id;

    const other_meetup = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #15`,
      user_id: other_user.id,
    });
    other_meetup_id = other_meetup.id;

    date.setDate(date.getDate() - 2);
    const past_meetup = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #16`,
      user_id: other_user.id,
    });
    past_meetup_id = past_meetup.id;

    const { id: another_meetup_id } = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #15`,
      user_id: other_user.id,
    });
    await Subscription.create({
      meetup_id: another_meetup_id,
      user_id,
    });
  });

  it('should be able to subscribe to meetup', async () => {
    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id,
      });

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      meetup_id,
      user_id,
    });
  });

  it('should not be able to subscribe to past meetup', async () => {
    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id: past_meetup_id,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("You can't subscribe to a past meetup");
  });

  it('should not be able to subscribe twice in the same meetup', async () => {
    await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id,
      });

    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are already subscribed to this meetup ' +
        'or there is another meetup in the same time'
    );
  });

  it('should not be able to subscribe to meetups at the same date and time', async () => {
    await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id,
      });

    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meetup_id: other_meetup_id,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are already subscribed to this meetup ' +
        'or there is another meetup in the same time'
    );
  });

  it("should be able to retrieve user's subscriptions that not occur yet", async () => {
    const response = await request(app)
      .get('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(subscription => {
      expect(isBefore(parseISO(subscription.date), new Date())).toBe(false);
    });
  });
});
