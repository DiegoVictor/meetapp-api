const faker = require('faker');

module.exports = {
  up: async queryInterface => {
    const meetups = [];
    const users = await queryInterface.sequelize.query('SELECT id from users');
    const banners = await queryInterface.sequelize.query(
      'SELECT id from files'
    );

    const users_id = users[0].map(user => user.id);
    const banners_id = banners[0].map(banner => banner.id);

    for (let i = 0; i < 40; i += 1) {
      meetups.push({
        banner_id: banners_id[Math.floor(Math.random() * banners_id.length)],
        created_at: new Date(),
        date: faker.date.recent(),
        description: faker.lorem.paragraphs(2),
        localization: faker.address.streetAddress(),
        title: faker.name.title(),
        updated_at: new Date(),
        user_id: users_id[Math.floor(Math.random() * users_id.length)],
      });
    }

    return queryInterface.bulkInsert('meetups', meetups, {});
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('meetups', null, {});
  },
};
