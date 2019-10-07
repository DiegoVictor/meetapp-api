import 'dotenv/config';

export default {
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
  dialect: 'postgres',
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  logging: parseInt(process.env.SEQUELIZE_LOG, 10),
};
