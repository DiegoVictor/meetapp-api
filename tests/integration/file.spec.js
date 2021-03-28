import fs from 'fs';
import path from 'path';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factory';
import jwtoken from '../utils/jwtoken';

describe('File', () => {
  it('should be able to register a file', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id);

    const fileName = 'image.jpg';
    const filePath = path.resolve(__dirname, '..', 'utils', fileName);

    const response = await request(app)
      .post('/v1/files')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      url: expect.any(String),
      name: fileName,
    });

    fs.unlinkSync(
      path.resolve(__dirname, '..', '..', 'tmp', 'uploads', response.body.path)
    );
  });
});
