import Sequelize from 'sequelize';
import database from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Subscription from '../app/models/Subscription';

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.postgres = new Sequelize(database);
    [User, File, Meetup, Subscription]
      .map(model => model.init(this.postgres))
      .map(model => model.associate && model.associate(this.postgres.models));
  }
}

export default new Database();
