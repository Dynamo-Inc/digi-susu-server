import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional } from 'sequelize';

class UserAccountMeta extends Model<InferAttributes<UserAccountMeta>, InferCreationAttributes<UserAccountMeta>> {
  declare id: CreationOptional<number>;
  declare isEmailVerified: boolean;
  declare hasAgreedToTermsAndAgreements: boolean;
  declare authType?: string;
  declare ownerId: string;
  declare status: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    // define association here
    this.belongsTo(models.User, {
      foreignKey: 'ownerId',
      targetKey: 'id',
      as: 'loginMeta',
    });
  }
}

export const initUserAccountMeta = (sequelize: Sequelize) => {
  UserAccountMeta.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      hasAgreedToTermsAndAgreements: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      authType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ACTIVE',
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
      modelName: 'UserAccountMeta',
      tableName: 'susu_users_account_meta',
      underscored: true,
    },
  );
};

export default UserAccountMeta;
