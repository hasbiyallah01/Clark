import { DataTypes, Model } from "sequelize";
const sequelize = require("../config/Sequelize.ts");

class PDFFiles extends Model {
  public id!: number;
  public workspaceId!: string;
  public userId!: string;
  public filePath!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

PDFFiles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workspaceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "pdf_files",
  }
);

export default PDFFiles;