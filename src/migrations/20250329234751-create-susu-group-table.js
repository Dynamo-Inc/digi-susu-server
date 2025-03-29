'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('susu_groups', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      creator_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      contribution_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      cycle_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      frequency: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
      },
      max_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payout_method: {
        type: Sequelize.ENUM('bank', 'mobile_money'),
        allowNull: false,
        defaultValue: 'mobile_money',
      },
      enable_auto_payout: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GHS',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('susu_groups');
  },
};
