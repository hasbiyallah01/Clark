import { DataTypes, Model } from "sequelize";
const sequelize = require("./../Setup/Sequelize.ts");

class userWaitlist extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
}

userWaitlist.init(
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
    sequelize,
    tableName: "users_waitlist",
  }
);

export default userWaitlist;
