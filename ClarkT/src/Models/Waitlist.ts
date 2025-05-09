import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class UserWaitlist extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
}

UserWaitlist.init(
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

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "users_waitlist",
    modelName: "UserWaitlist",
  }
);

export default UserWaitlist;
