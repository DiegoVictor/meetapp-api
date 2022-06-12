import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import request from 'supertest';

import app from '../../src/app';
import User from '../../src/app/models/User';
import factory from '../utils/factory';
import jwtoken from '../utils/jwtoken';

describe('User', () => {
  beforeEach(async () => {
    await User.truncate();
  });

  it('should be able to register a user', async () => {
    const user = await factory.attrs('User');
    const response = await request(app).post('/v1/users').send(user);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      email: user.email,
      name: user.name,
    });
  });

  it('encrypt user password when new user is created', async () => {
    const password = '123456';
    const { password_hash } = await factory.create('User', { password });

    const compare_hash = await bcrypt.compare(password, password_hash);
    expect(compare_hash).toBe(true);
  });

  it("should be able to update a user's password", async () => {
    const { id, name, password } = await factory.create('User');
    const { password: new_password } = await factory.attrs('User');
    const token = jwtoken(id);

    const response = await request(app)
      .put('/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: password,
        password: new_password,
        confirm_password: new_password,
      });

    expect(response.body).toMatchObject({ id, name });
  });

  it('should fail because the provided old password is wrong', async () => {
    const { id } = await factory.create('User');
    const new_password = faker.internet.password();
    const token = jwtoken(id);

    const response = await request(app)
      .put('/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send({
        old_password: new_password,
        password: new_password,
        confirm_password: new_password,
      });

    expect(response.body.message).toBe('Password does not match');
  });

  it('should fail because the provided email is already taken', async () => {
    const [{ id }, { email }] = await factory.createMany('User', 2);
    const token = jwtoken(id);

    const response = await request(app)
      .put('/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .send({ email });

    expect(response.body.message).toBe('Email already in use');
  });
});
