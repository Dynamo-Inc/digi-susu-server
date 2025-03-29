import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional } from 'sequelize';

class UserLoginMeta extends Model<InferAttributes<UserLoginMeta>, InferCreationAttributes<UserLoginMeta>> {
  declare id: CreationOptional<number>;
  declare lastLoginAt: Date;
  declare ownerId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'ownerId',
      targetKey: 'id',
      as: 'loginMeta',
    });
  }
}

export const initUserLoginMeta = (sequelize: Sequelize) => {
  UserLoginMeta.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'UserLoginMeta',
      tableName: 'susu_users_login_meta',
      underscored: true,
    },
  );
};

export default UserLoginMeta;
