import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import User from '../../src/app/models/User';
import { SECRET, EXPIRATION_TIME } from '../../src/config/auth';
import Meetup from '../../src/app/models/Meetup';

describe('Scheduled', () => {
  let token;
  let user_id;

  beforeAll(async () => {
    const user = await User.create({
      name: 'user',
      email: 'user7@test.com',
      password: '123456',
    });
    user_id = user.id;

    token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: EXPIRATION_TIME,
    });

    const date = new Date();
    await Meetup.create({
      date,
      description: 'Lorem Ipsum',
      localization: 'Dolor sit amet',
      title: `Meetup Test #13`,
      user_id,
    });
  });

  it("should return user's scheduled meetups", async () => {
    const response = await request(app)
      .get('/scheduled')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].user_id).toBe(user_id);
  });
});
