require('../bootstrap');

module.exports = {
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  logging: parseInt(process.env.SEQUELIZE_LOG, 10),
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  storage: './tests/database.sqlite',
  username: process.env.DB_USER,
};
