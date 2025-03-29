import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional } from 'sequelize';
import { TokenType, TokenTypes } from '../types/auth.types';

class Token extends Model<InferAttributes<Token>, InferCreationAttributes<Token>> {
  declare id: CreationOptional<number>;
  declare userId: string;
  declare userType: 'provider' | 'user' | string;
  declare token: string;
  declare otp: string | null;
  declare type: TokenType;
  declare phone: string | null;
  declare email: string | null;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      constraints: false,
      as: 'user',
    });
  }
}

export const initToken = (sequelize: Sequelize) => {
  Token.init(
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
      userType: {
        type: DataTypes.ENUM('provider', 'user'),
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(TokenTypes)),
        allowNull: false,
        defaultValue: TokenTypes.ACCESS,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
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
      modelName: 'Token',
      tableName: 'susu_tokens',
      underscored: true,
      indexes: [{ fields: ['expiresAt'], name: 'expiresAt_idx' }, { fields: ['token'], name: 'token_idx' }, { fields: ['userId'] }],
    },
  );
};

export default Token;
