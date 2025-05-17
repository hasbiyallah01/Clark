"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_CONNECTION = process.env.DB_CONNECTION;
const DB_MODE = process.env.DB_MODE;
let sequelize;
if (DB_MODE === 'URL') {
    const DATABASE_URL = process.env.DATABASE_URL;
    sequelize = new sequelize_1.Sequelize(DATABASE_URL, {
        dialect: DB_CONNECTION,
    });
}
else {
    sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
        host: DB_HOST,
        dialect: DB_CONNECTION,
    });
}
exports.default = sequelize;
