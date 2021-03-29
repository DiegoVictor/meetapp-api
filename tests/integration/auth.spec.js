import faker from 'faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factory';
import jwtoken from '../utils/jwtoken';

describe('Auth', () => {
  it('should fail because a JWT token was not provided', async () => {
    const response = await request(app)
      .post('/v1')
      .expect(401)
      .send();

    expect(response.body.message).toBe('Token not provided');
  });

  it('should fail because a invalid JWT token was not provided', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id) + faker.random.alphaNumeric();
    const response = await request(app)
      .post('/v1')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .send();

    expect(response.body.message).toBe('Token invalid');
  });
});