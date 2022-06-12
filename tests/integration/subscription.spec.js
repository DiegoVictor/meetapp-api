import { isAfter, parseISO } from 'date-fns';
import { faker } from '@faker-js/faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factory';
import jwtoken from '../utils/jwtoken';
import Meetup from '../../src/app/models/Meetup';
import User from '../../src/app/models/User';

describe('Subscription', () => {
  beforeEach(async () => {
    await Promise.all([User.truncate(), Meetup.truncate()]);
  });

  it('should be able to subscribe to meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);

    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    expect(response.body).toMatchObject({
      meetup_id,
      id: expect.any(Number),
      user_id: id,
    });
  });

  it('should not be able to subscribe to meetup created by itself', async () => {
    const [{ id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id: id });
    const token = jwtoken(id);

    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send({ meetup_id });

    expect(response.body.message).toBe(
      'Meetup does not exists or is owned by the provided user'
    );
  });

  it('should not be able to subscribe to past meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', {
      user_id,
      date: faker.date.past(),
    });
    const token = jwtoken(id);
    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .send({ meetup_id });

    expect(response.body.message).toBe("You can't subscribe to a past meetup");
  });

  it('should not be able to subscribe twice in the same meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);

    await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send({ meetup_id });

    expect(response.body.message).toBe(
      'You are already subscribed to this meetup ' +
        'or there is another meetup in the same time'
    );
  });

  it('should not be able to subscribe to meetups at the same date and time', async () => {
    const date = faker.date.future();
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const [{ id: meetup_id }, { id: other_meetup_id }] =
      await factory.createMany('Meetup', 2, {
        user_id,
        date,
      });
    const token = jwtoken(id);

    await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send({ meetup_id: other_meetup_id });

    expect(response.body.message).toBe(
      'You are already subscribed to this meetup ' +
        'or there is another meetup in the same time'
    );
  });

  it("should be able to retrieve user's subscriptions that not occur yet", async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);

    await factory.create('Subscription', { meetup_id, user_id: id });

    const response = await request(app)
      .get('/v1/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect.extend({
      isAfter(received, date) {
        if (isAfter(parseISO(received), date)) {
          return {
            message: () =>
              `expected ${received} to not be a later date than ${date.toISOString()}`,
            pass: true,
          };
        }
        return {
          message: () =>
            `expected ${received} to be a earlier date than ${date.toISOString()}`,
          pass: false,
        };
      },
    });

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        date: expect.isAfter(new Date()),
      })
    );
  });

  it("should be able to retrieve the second page of user's subscriptions that not occur yet", async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    const meetups = await factory.createMany('Meetup', 60, { user_id });

    await Promise.all(
      meetups.map((meetup) =>
        factory.create('Subscription', { meetup_id: meetup.id, user_id: id })
      )
    );

    const response = await request(app)
      .get('/v1/subscriptions?page=2')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect.extend({
      isAfter(received, date) {
        if (isAfter(parseISO(received), date)) {
          return {
            message: () =>
              `expected ${received} to not be a later date than ${date.toISOString()}`,
            pass: true,
          };
        }
        return {
          message: () =>
            `expected ${received} to be a earlier date than ${date.toISOString()}`,
          pass: false,
        };
      },
    });

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(20);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        date: expect.isAfter(new Date()),
      })
    );
  });

  it('should be able to remove a subscription', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);

    await factory.create('Subscription', {
      meetup_id,
      user_id: id,
    });

    const response = await request(app)
      .delete(`/v1/subscriptions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
      .send({ meetup_id });

    expect(response.body).toMatchObject({});
  });

  it('should not be able to remove a subscription that not exists', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const meetup = await factory.create('Meetup', { user_id });
    const meetup_id = meetup.id;

    await meetup.destroy();
    const token = jwtoken(id);

    const response = await request(app)
      .delete(`/v1/subscriptions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send({ meetup_id });

    expect(response.body.message).toBe('Meetup or user does not exists');
  });
});
