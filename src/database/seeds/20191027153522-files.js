const faker = require('faker');
const Crypto = require('crypto');
const path = require('path');
const fs = require('fs');

module.exports = {
  up: async queryInterface => {
    const files = [];
    const tmp = path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads');

    for (let i = 0; i < 20; i += 1) {
      const name = faker.system.commonFileName('png');
      const hex = await Crypto.randomBytes(16).toString('hex');

      fs.copyFileSync(
        path.resolve(tmp, 'example.png'),
        path.resolve(tmp, `${hex}.png`)
      );

      files.push({
        created_at: new Date(),
        name,
        path: hex,
        updated_at: new Date(),
      });
    }

    return queryInterface.bulkInsert('files', files, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('files', null, {});
  },
};
