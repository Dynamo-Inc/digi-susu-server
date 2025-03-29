import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional, ForeignKey } from 'sequelize';

class SusuGroup extends Model<InferAttributes<SusuGroup>, InferCreationAttributes<SusuGroup>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare creatorId: ForeignKey<string>;
  declare contributionAmount: number;
  declare cycleDuration: number;
  declare frequency: 'daily' | 'weekly' | 'monthly';
  declare maxMembers: number;
  declare startDate: Date;
  declare code: string;
  declare private: boolean;
  declare status: 'active' | 'completed' | 'pending' | 'in_progress';
  declare payoutMethod: 'bank' | 'mobile_money';
  declare enableAutoPayout: boolean;
  declare currency: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'creator',
    });

    this.hasMany(models.Transaction, {
      foreignKey: 'groupId',
      as: 'transactions',
    });
  }
}

export const initSusuGroup = (sequelize: Sequelize) => {
  SusuGroup.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      contributionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cycleDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
      },
      maxMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payoutMethod: {
        type: DataTypes.ENUM('bank', 'mobile_money'),
        allowNull: false,
        defaultValue: 'mobile_money',
      },
      enableAutoPayout: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'GHS',
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
      modelName: 'SusuGroup',
      tableName: 'susu_groups',
      underscored: true,
    },
  );
};

export default SusuGroup;
