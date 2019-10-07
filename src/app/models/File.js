import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          get() {
            return `${process.env.APP_URL}:${process.env.APP_PORT}/files/${this.path}`;
          },
          type: Sequelize.VIRTUAL,
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;
