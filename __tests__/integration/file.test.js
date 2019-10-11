import request from 'supertest';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import app from '../../src/app';
import User from '../../src/app/models/User';
import { SECRET, EXPIRATION_TIME } from '../../src/config/auth';

describe('File', () => {
  let token;

  beforeAll(async () => {
    const { id } = await User.create({
      name: 'user',
      email: 'user10@test.com',
      password: '123456',
    });

    token = jwt.sign({ id }, SECRET, {
      expiresIn: EXPIRATION_TIME,
    });
  });

  it('should be able to register a file', () => {
    const filen_name = 'ee59117ef6837153c44d7793ea3639c2.jpg';
    const file_path = path.resolve(__dirname, '..', 'files', filen_name);

    fs.exists(file_path, async exists => {
      if (exists) {
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
});
