import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        description: Sequelize.STRING,
        localization: Sequelize.STRING,
        title: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { as: 'banner', foreignKey: 'banner_id' });
    this.belongsTo(models.User, { as: 'organizer', foreignKey: 'user_id' });
    this.hasMany(models.Subscription, {
      as: 'subscription',
      foreignKey: 'meetup_id',
    });
  }
}

export default Meetup;
