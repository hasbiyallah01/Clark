"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Sequelize_1 = __importDefault(require("../config/Sequelize"));
class Workspace extends sequelize_1.Model {
}
Workspace.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    enc_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "0",
    }
}, {
    sequelize: Sequelize_1.default,
    tableName: "workspaces",
    modelName: "Workspace",
});
exports.default = Workspace;
