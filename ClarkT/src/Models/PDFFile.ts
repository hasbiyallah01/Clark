import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class PDFFiles extends Model {
  public id!: number;
  public workspaceId!: string;
  public userId!: string;
  public filePath!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PDFFiles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
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
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "pdf_files",
    modelName: "PDFFiles",
  }
);

export default PDFFiles;
