const { Sequelize } = require('sequelize');

import dotenv from "dotenv";
dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_CONNECTION = process.env.DB_CONNECTION;
const NODE_ENV = process.env.NODE_ENV;
const DB_MODE = process.env.DB_MODE


if(DB_MODE == 'URL'){
  const DATABASE_URL = process.env.DATABASE_URL;
  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: DB_CONNECTION
  });
  
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection url has been established successfully.');
    })
    .catch((err:any) => {
      console.error('Unable to connect to the database:', err);
    });
  
  module.exports = sequelize;
}
else{
  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_CONNECTION
  });
  
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err:any) => {
      console.error('Unable to connect to the database:', err);
    });
  
  module.exports = sequelize;
}
