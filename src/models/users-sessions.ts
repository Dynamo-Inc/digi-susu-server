import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional } from 'sequelize';
import { UserSessionType, UserSessionTypes } from '../types/auth.types';

class UserSession extends Model<InferAttributes<UserSession>, InferCreationAttributes<UserSession>> {
  declare id: CreationOptional<number>;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare otp?: string;
  declare email?: string;
  declare phone?: string;
  declare invitedBy?: string;
  declare type: UserSessionType;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export const initUserSession = (sequelize: Sequelize) => {
  UserSession.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(UserSessionTypes)),
        allowNull: false,
        defaultValue: UserSessionTypes.ACCESS,
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
      modelName: 'UserSession',
      tableName: 'susu_user_sessions',
      underscored: true,
      indexes: [{ fields: ['expires_at'] }, { fields: ['token'] }, { fields: ['user_id'] }],
    },
  );
};

export default UserSession;
