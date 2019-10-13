import { isAfter, parseISO } from 'date-fns';
import faker from 'faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factories';
import jwtoken from '../utils/jwtoken';
import Meetup from '../../src/app/models/Meetup';

describe('Scheduled', () => {
  it('should be able to subscribe to meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);
    const response = await request(app)
      .post('/subscriptions')
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
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Meetup does not exists or is owned by the provided user'
    );
  });

  it('should fail because the fields are missing', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id);
    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');
    expect(response.body.details).toBeDefined();
  });

  it('should not be able to subscribe to past meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', {
      user_id,
      date: faker.date.past(),
    });
    const token = jwtoken(id);
    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("You can't subscribe to a past meetup");
  });

  it('should not be able to subscribe twice in the same meetup', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);
    await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are already subscribed to this meetup ' +
        'or there is another meetup in the same time'
    );
  });

  it('should not be able to subscribe to meetups at the same date and time', async () => {
    const date = faker.date.future();
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const [
      { id: meetup_id },
      { id: other_meetup_id },
    ] = await factory.createMany('Meetup', 2, {
      user_id,
      date,
    });
    const token = jwtoken(id);

    await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id });

    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ meetup_id: other_meetup_id });

    expect(response.status).toBe(401);
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
      .get('/subscriptions')
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

  it('should be able to remove a subscription', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: meetup_id } = await factory.create('Meetup', { user_id });
    const token = jwtoken(id);

    const { id: subscription_id } = await factory.create('Subscription', {
      meetup_id,
      user_id: id,
    });

    const response = await request(app)
      .delete(`/subscriptions/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.body).toMatchObject({ id: subscription_id });
  });

  it('should not be able to remove a subscription that not exists', async () => {
    const { id } = await factory.create('User');
    const { id: last_meetup_id } = Meetup.findOne({
      order: [['createdAt', 'DESC']],
    });
    const token = jwtoken(id);

    const response = await request(app)
      .delete(`/subscriptions/${last_meetup_id + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Meetup or user does not exists');
  });
});
