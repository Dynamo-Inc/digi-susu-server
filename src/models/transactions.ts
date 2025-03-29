import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional, ForeignKey } from 'sequelize';

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare groupId: ForeignKey<string>;
  declare type: 'contribution' | 'payout';
  declare amount: number;
  declare paymentMethod: 'momo' | 'crypto' | 'manual';
  declare status: 'pending' | 'completed' | 'failed';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    this.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group',
    });
  }
}

export const initTransaction = (sequelize: Sequelize) => {
  Transaction.init(
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
      groupId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('contribution', 'payout'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM('momo', 'crypto', 'manual', 'bank'),
        defaultValue: 'momo',
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
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
      modelName: 'Transaction',
      tableName: 'susu_transactions',
      underscored: true,
    },
  );
};

export default Transaction;
