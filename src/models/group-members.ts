import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, CreationOptional, ForeignKey } from 'sequelize';

class SusuGroupMember extends Model<InferAttributes<SusuGroupMember>, InferCreationAttributes<SusuGroupMember>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare groupId: ForeignKey<string>;
  declare joinDate: CreationOptional<Date>;
  declare payoutPosition: number;
  declare payoutDate: CreationOptional<Date>;
  declare hasReceivedPayout: boolean;
  declare status: 'pending' | 'active' | 'disqualified';
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

export const initSusuGroupMember = (sequelize: Sequelize) => {
  SusuGroupMember.init(
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
      joinDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      payoutPosition: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payoutDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hasReceivedPayout: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'disqualified'),
        allowNull: false,
        defaultValue: 'pending',
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
      modelName: 'SusuGroupMember',
      tableName: 'susu_group_members',
      underscored: true,
    },
  );
};

export default SusuGroupMember;
