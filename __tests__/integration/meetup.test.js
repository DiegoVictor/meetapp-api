import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import User from '../../src/app/models/User';
import File from '../../src/app/models/File';
import { SECRET, EXPIRATION_TIME } from '../../src/config/auth';
import Meetup from '../../src/app/models/Meetup';

describe('Meetup', () => {
  const date = new Date();
  const meetup = {
    description: 'Lorem Ipsum',
    localization: 'Dolor sit amet',
    title: `Meetup Test #12`,
  };
  let token;
  let banner_id;
  let user_id;
  let meetup_id;
  let past_meetup_id;

  date.setHours(12);

  beforeAll(async () => {
    const user = await User.create({
      name: 'user',
      email: 'user6@test.com',
      password: '123456',
    });
    user_id = user.id;

    token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: EXPIRATION_TIME,
    });

    for (let i = 0; i < 10; i += 1) {
      await Meetup.create({
        date,
        description: 'Lorem Ipsum',
        localization: 'Dolor sit amet',
        title: `Meetup Test #${i + 1}`,
      });
    }

    date.setDate(date.getDate() - 2);
    const past_meetup = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #13`,
      user_id,
    });
    past_meetup_id = past_meetup.id;

    date.setDate(date.getDate() + 3);
    await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: 'Meetup Test #12',
    });

    const future_meetup = await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: 'Meetup Test #14',
    });

    meetup_id = future_meetup.id;

    const file = await File.create({
      name: '333580.jpg',
      path: '7aa806a99dff90c932456ea0555d09e1.jpg',
    });
    banner_id = file.id;
  });

  it('should return the first page of meetups with 10 itens', async () => {
    const response = await request(app)
      .get('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(10);
  });

  it("should return the meetups with it's organizers", async () => {
    const response = await request(app)
      .get('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('organizer');
  });

  it('should return a meetups list with date to tomorrow', async () => {
    const response = await request(app)
      .get(`/meetups?date=${date.toISOString().slice(0, 10)}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return the second page of meetups', async () => {
    const response = await request(app)
      .get(`/meetups?page=2`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should be able to create a meetup', async () => {
    const response = await request(app)
      .post(`/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...meetup,
        date,
        banner_id,
        user_id,
      });

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      user_id,
      banner_id,
      title: meetup.title,
      description: meetup.description,
      localization: meetup.localization,
      date: date.toISOString(),
    });
  });

  it('should fail creation in validation', async () => {
    const response = await request(app)
      .post(`/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.messages).toBeDefined();
  });

  it('should not be able to create a meetup with past date', async () => {
    const past_date = new Date();
    past_date.setDate(past_date.getDate() - 1);
    const response = await request(app)
      .post(`/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...meetup,
        date: past_date,
        banner_id,
        user_id,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Past dates are not permited');
  });

  it('should be able to edit a meetup', async () => {
    const new_date = new Date();
    new_date.setDate(new_date.getDate() + 1);

    const response = await request(app)
      .put(`/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: new_date,
        description: 'Ipsum Lorem',
        localization: 'Amet Sit Dolor',
        title: 'Meetup Test #14',
        banner_id,
      });

    expect(response.body).toMatchObject({
      id: meetup_id,
      user_id,
      banner_id,
      title: 'Meetup Test #14',
      description: 'Ipsum Lorem',
      localization: 'Amet Sit Dolor',
      date: new_date.toISOString(),
    });
  });

  it('should not be able to edit a past meetup', async () => {
    const response = await request(app)
      .put(`/meetups/${past_meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Ipsum Lorem',
        localization: 'Amet Sit Dolor',
        title: 'Meetup Test #14',
        banner_id,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("You can't edit past meetups");
  });

  it('should not be able to delete a past meetup', async () => {
    const response = await request(app)
      .delete(`/meetups/${past_meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("You can't remove past meetups");
  });
});
