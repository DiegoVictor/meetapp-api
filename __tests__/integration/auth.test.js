import faker from 'faker';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factories';
import jwtoken from '../utils/jwtoken';

describe('Scheduled', () => {
  it('should fail because a JWT token was not provided', async () => {
    const response = await request(app)
      .post('/subscriptions')
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token not provided');
  });

  it('should fail because a invalid JWT token was not provided', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id) + faker.random.alphaNumeric();
    const response = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalid');
  });
});
