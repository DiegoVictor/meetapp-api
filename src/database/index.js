import Sequelize from 'sequelize';

import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Subscription from '../app/models/Subscription';
import User from '../app/models/User';

import database from '../config/database';

const postgres = new Sequelize(database);

export default () => {
  [User, File, Meetup, Subscription]
    .map(model => model.init(postgres))
    .map(model => {
      return model.associate && model.associate(postgres.models);
    });
};
