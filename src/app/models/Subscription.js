import { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
        modelName: 'Subscription',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Meetup;
