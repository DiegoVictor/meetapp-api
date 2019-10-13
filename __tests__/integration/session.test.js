import { promisify } from 'util';
import faker from 'faker';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factories';

describe('Session', () => {
  it('should be able to authenticate user', async () => {
    const password = '123456';
    const { id, name, email } = await factory.create('User', {
      password,
    });

    const response = await request(app)
      .post('/sessions')
      .send({ email, password });

    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: expect.objectContaining({ id, email, name }),
    });
  });

  it('should return a valid JWT token', async () => {
    const { id, email, password } = await factory.create('User');
    const response = await request(app)
      .post('/sessions')
      .send({ email, password });

    const { token } = response.body;
    const decoded = await promisify(jwt.verify)(token, process.env.APP_SECRET);

    expect(decoded).toMatchObject({
      id,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('should fail in validation', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');
    expect(response.body.details).toBeDefined();
  });

  it('should fail because user not exists', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('User not found');
  });

  it('should fail because the password does not match', async () => {
    const { email } = await factory.create('User');
    const response = await request(app)
      .post('/sessions')
      .send({
        email,
        password: faker.internet.password(),
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Password does not match');
  });
});
