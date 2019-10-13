import fs from 'fs';
import path from 'path';
import request from 'supertest';

import app from '../../src/app';
import factory from '../utils/factories';
import jwtoken from '../utils/jwtoken';

describe('File', () => {
  it('should be able to register a file', async () => {
    const { id } = await factory.create('User');
    const token = jwtoken(id);

    const filen_name = 'ee59117ef6837153c44d7793ea3639c2.jpg';
    const file_path = path.resolve(__dirname, '..', 'files', filen_name);

    if (fs.existsSync(file_path)) {
      const response = await request(app)
        .post('/files')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', file_path);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        url: expect.any(String),
        name: filen_name,
      });
    } else {
      throw Error('File does not exists!');
    }
  });
});
