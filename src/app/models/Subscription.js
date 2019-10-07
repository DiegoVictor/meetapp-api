import { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        modelName: 'Subscription',
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Meetup, { as: 'meetup', foreignKey: 'meetup_id' });
    this.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
  }
}

export default Meetup;
