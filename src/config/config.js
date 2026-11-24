require('dotenv').config();
const shared = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'space_games',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: { timestamps: false }
};
module.exports = { development: { ...shared }, test: { ...shared }, production: { ...shared } };
