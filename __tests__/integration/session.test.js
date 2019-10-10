import request from 'supertest';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import app from '../../src/app';
import User from '../../src/app/models/User';

describe('Session', () => {
  const user = {
    name: 'test',
    email: 'user@test.com',
  };
  const password = '123456';

  beforeAll(async () => {
    const { id } = await User.create({
      ...user,
      password,
    });
    user.id = id;
  });

  it('should be able to authenticate with email and password', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password,
      });

    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(Number),
        email: user.email,
        name: user.name,
      }),
    });
  });

  it('should return a valid JWT token', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password,
      });

    const { token } = response.body;
    const decoded = await promisify(jwt.verify)(token, process.env.APP_SECRET);

    expect(decoded).toMatchObject({
      id: user.id,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('should fail in validation', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.messages).toBeDefined();
  });

  it('should return that the user does not exists', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'unauthorized@test.com',
        password,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should return password does not match', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: '654321',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
