import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const DB_NAME = process.env.DB_NAME!;
const DB_USERNAME = process.env.DB_USERNAME!;
const DB_PASSWORD = process.env.DB_PASSWORD!;
const DB_HOST = process.env.DB_HOST!;
const DB_CONNECTION = process.env.DB_CONNECTION as any;
const DB_MODE = process.env.DB_MODE;

let sequelize: Sequelize;

if (DB_MODE === 'URL') {
  const DATABASE_URL = process.env.DATABASE_URL!;
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: DB_CONNECTION,
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_CONNECTION,
  });
}

export default sequelize;
