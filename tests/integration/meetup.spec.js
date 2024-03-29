import { faker } from '@faker-js/faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factory';
import jwtoken from '../utils/jwtoken';
import File from '../../src/app/models/File';
import User from '../../src/app/models/User';
import Meetup from '../../src/app/models/Meetup';
import Subscription from '../../src/app/models/Subscription';

describe('Meetup', () => {
  beforeEach(async () => {
    await Promise.all([
      User.truncate(),
      Meetup.truncate(),
      Subscription.truncate(),
      File.truncate(),
    ]);
  });

  it('should be able to get a page of meetups (20 itens)', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    await factory.createMany('Meetup', 20, { user_id });

    const response = await request(app)
      .get('/v1/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(20);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        id: expect.any(Number),
      })
    );
  });

  it('should be able to get only meetups not scheduled by yourself', async () => {
    const [{ id }, organizer] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    const [meetup, scheduledMeetup] = await factory.createMany('Meetup', 2, {
      user_id: organizer.id,
    });
    await factory.create('Subscription', {
      user_id: id,
      meetup_id: scheduledMeetup.id,
    });

    const response = await request(app)
      .get('/v1/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    const organizerJson = {
      ...organizer.toJSON(),
      createdAt: organizer.createdAt.toISOString(),
      updatedAt: organizer.updatedAt.toISOString(),
    };

    delete organizerJson.password;
    delete organizerJson.password_hash;

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body).toContainEqual({
      ...meetup.toJSON(),
      banner: null,
      banner_id: null,
      createdAt: meetup.createdAt.toISOString(),
      updatedAt: meetup.updatedAt.toISOString(),
      date: meetup.date.toISOString(),
      organizer: organizerJson,
      url: `${process.env.APP_URL}:${process.env.APP_PORT}/v1/meetups/${meetup.id}`,
    });
  });

  it("should get meetups with it's organizers", async () => {
    const [{ id }, { id: user_id, name }] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    await factory.createMany('Meetup', 5, { user_id });

    const response = await request(app)
      .get('/v1/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        organizer: expect.objectContaining({ id: expect.any(Number), name }),
      })
    );
  });

  it('should get meetups with date to tomorrow', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const token = jwtoken(id);
    const date = '2019-10-13';

    await factory.createMany('Meetup', 10, {
      user_id,
      date: new Date(`${date}T12:00:00`),
    });

    const response = await request(app)
      .get(`/v1/meetups?date=${date}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(10);

    const regexp = new RegExp(`^${date}T`);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        date: expect.stringMatching(regexp),
      })
    );
  });

  it('should get the second page of meetups', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    await factory.createMany('Meetup', 60, { user_id });

    const response = await request(app)
      .get(`/v1/meetups?page=2`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(20);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        id: expect.any(Number),
      })
    );
  });

  it('should be able to create a meetup', async () => {
    const { id } = await factory.create('User');
    const { id: banner_id } = await factory.create('File');
    const meetup = await factory.attrs('Meetup', { banner_id });
    const token = jwtoken(id);

    const response = await request(app)
      .post(`/v1/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .send(meetup);

    expect(response.body).toMatchObject({
      ...meetup,
      id: expect.any(Number),
      date: meetup.date.toISOString(),
    });
  });

  it('should fail because the provided banner not exists', async () => {
    const { id } = await factory.create('User');
    const banner = await factory.create('File');
    const meetup = await factory.attrs('Meetup', {
      banner_id: banner.id,
    });

    await banner.destroy();

    const token = jwtoken(id);

    const response = await request(app)
      .post(`/v1/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send(meetup);

    expect(response.body.message).toBe('The provided banner does not exists');
  });

  it('should not be able to create a meetup with past date', async () => {
    const { id } = await factory.create('User');
    const { id: banner_id } = await factory.create('File');
    const meetup = await factory.attrs('Meetup', {
      banner_id,
      date: faker.date.past().toISOString(),
    });
    const token = jwtoken(id);

    const response = await request(app)
      .post(`/v1/meetups`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send(meetup);

    expect(response.body.message).toBe('Past dates are not permited');
  });

  it('should be able to edit a meetup', async () => {
    const { id } = await factory.create('User');
    const { id: banner_id } = await factory.create('File');
    const { id: meetup_id, date } = await factory.create('Meetup', {
      banner_id,
    });
    const token = jwtoken(id);
    const data = {
      description: faker.lorem.paragraphs(2),
      localization: faker.location.streetAddress(),
      title: faker.lorem.words(),
    };
    const response = await request(app)
      .put(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(response.body).toMatchObject({
      id: meetup_id,
      user_id: id,
      banner_id,
      date: date.toISOString(),
      ...data,
    });
  });

  it('should fail because the provided banner not exists', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: banner_id } = await factory.create('File');
    const { id: meetup_id } = await factory.create('Meetup', {
      banner_id,
      user_id,
    });
    const banner = await File.findOne({
      order: [['createdAt', 'DESC']],
    });
    const token = jwtoken(id);

    await banner.destroy();

    const response = await request(app)
      .put(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send({
        banner_id: banner.id,
      });

    expect(response.body.message).toBe('The provided banner does not exists');
  });

  it('should fail because was provided a past date', async () => {
    const [{ id }, { id: user_id }] = await factory.createMany('User', 2);
    const { id: banner_id } = await factory.create('File');
    const { id: meetup_id } = await factory.create('Meetup', {
      banner_id,
      user_id,
    });

    const token = jwtoken(id);

    const response = await request(app)
      .put(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send({
        date: faker.date.past(),
      });

    expect(response.body.message).toBe('Past dates are not permited');
  });

  it('should not be able to edit a past meetup', async () => {
    const { id } = await factory.create('User');
    const { id: banner_id } = await factory.create('File');
    const { id: meetup_id } = await factory.create('Meetup', {
      banner_id,
      date: faker.date.past(),
    });
    const token = jwtoken(id);

    const response = await request(app)
      .put(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .send({
        title: faker.lorem.words(),
      });

    expect(response.body.message).toBe("You can't edit past meetups");
  });

  it('should be able to delete a meetup', async () => {
    const { id } = await factory.create('User');
    const { id: meetup_id } = await factory.create('Meetup');
    const token = jwtoken(id);

    const response = await request(app)
      .delete(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
      .send();

    expect(response.body).toMatchObject({});
  });

  it('should not be able to delete a past meetup', async () => {
    const { id } = await factory.create('User');
    const { id: banner_id } = await factory.create('File');
    const { id: meetup_id } = await factory.create('Meetup', {
      banner_id,
      date: faker.date.past(),
    });
    const token = jwtoken(id);

    const response = await request(app)
      .delete(`/v1/meetups/${meetup_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .send();

    expect(response.body.message).toBe("You can't remove past meetups");
  });

  it('should not be able to delete meetup that not exists', async () => {
    const { id } = await factory.create('User');
    const meetup = await factory.create('Meetup');
    const token = jwtoken(id);

    await meetup.destroy();

    const response = await request(app)
      .delete(`/v1/meetups/${meetup.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send();

    expect(response.body.message).toBe('Meetup does not exists');
  });
});
