import { DataTypes, Model } from "sequelize";
const sequelize = require("./../config/Sequelize.ts");

class Workspace extends Model {
  public id!: number;
  public name!: string;
  public ownerId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Workspace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "workspaces",
  }
);

export default Workspace;