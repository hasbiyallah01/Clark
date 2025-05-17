"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Sequelize_1 = __importDefault(require("../config/Sequelize"));
class PDFFiles extends sequelize_1.Model {
}
PDFFiles.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fileName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    workspaceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    size: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: Sequelize_1.default,
    tableName: "pdf_files",
    modelName: "PDFFiles",
});
exports.default = PDFFiles;
