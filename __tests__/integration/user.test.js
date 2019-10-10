import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../../src/app';
import User from '../../src/app/models/User';
import { SECRET, EXPIRATION_TIME } from '../../src/config/auth';

describe('User', () => {
  const password = '123456';
  const new_password = '654321';
  const user = {
    name: 'user',
    email: 'user2@test.com',
    password,
  };
  let another_user;
  let other_user;
  let token;

  beforeAll(async () => {
    other_user = await User.create({
      name: 'user',
      email: 'user4@test.com',
      password,
    });

    another_user = await User.create({
      name: 'user',
      email: 'user3@test.com',
      password,
    });

    token = jwt.sign({ id: another_user.id }, SECRET, {
      expiresIn: EXPIRATION_TIME,
    });
  });

  it('should be able to register a user with name, email and password', async () => {
    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      email: user.email,
      name: user.name,
    });
  });

  it('encrypt user password when new user is created', async () => {
    const response = await User.create({
      ...user,
      email: 'user5@test.com',
    });

    const compare_hash = await bcrypt.compare(password, response.password_hash);
    expect(compare_hash).toBe(true);
  });

  it('should be able to update a user password', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: password,
        password: new_password,
        confirm_password: new_password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: another_user.name,
    });
  });

  it('should return that the old password typed do not match the current', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: '235416',
        password: new_password,
        confirm_password: new_password,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it('should return that the new email is already taken', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: other_user.email,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it('should fail in validation', async () => {
    const response = await request(app)
      .post('/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.messages).toBeDefined();
  });
});
