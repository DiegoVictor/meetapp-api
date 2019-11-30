import bcrypt from 'bcryptjs';
import faker from 'faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factories';
import jwtoken from '../utils/jwtoken';

describe('User', () => {
  it('should be able to register a user', async () => {
    const user = await factory.attrs('User');
    const response = await request(app)
      .post('/users')
      .send(user);

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
      .put('/users')
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
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: new_password,
        password: new_password,
        confirm_password: new_password,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Password does not match');
  });

  it('should fail because the provided email is already taken', async () => {
    const [{ id }, { email }] = await factory.createMany('User', 2);
    const token = jwtoken(id);
    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email already in use');
  });

  it('should fail in validation, missing fields', async () => {
    const response = await request(app)
      .post('/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');
    expect(response.body.details).toBeDefined();
  });

  it('should fail in validation, wrong data types and sizes', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id);
    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        confirm_password: faker.random.number(),
        email: faker.random.word(),
        name: faker.random.number(),
        password: faker.internet.password(3),
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation fails');
    expect(response.body.details).toBeDefined();
  });
});
