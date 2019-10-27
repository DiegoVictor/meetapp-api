const bcryptjs = require('bcryptjs');
const faker = require('faker');

module.exports = {
  up: async queryInterface => {
    const password_hash = await bcryptjs.hash('123456', 8);
    const users = [];

    for (let i = 0; i < 10; i += 1) {
      users.push({
        created_at: new Date(),
        email: faker.internet.email(),
        name: faker.name.findName(),
        password_hash,
        updated_at: new Date(),
      });
    }

    return queryInterface.bulkInsert('users', users, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
