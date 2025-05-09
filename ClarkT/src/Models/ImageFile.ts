import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class ImageFiles extends Model {
  public id!: number;
  public workspaceId!: string;
  public userId!: string;
  public filePath!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ImageFiles.init(
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
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "image_files",
    modelName: "ImageFiles",
  }
);

export default ImageFiles;
