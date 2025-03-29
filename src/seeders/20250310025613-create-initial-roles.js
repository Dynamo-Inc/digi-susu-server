'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Define initial roles and permissions
      const rolesData = [
        {
          id: uuidv4(),
          name: 'admin',
          description: 'Gives admin access to all actions',
          permissions: ['*:*'],
        },
      ];

      // Insert roles
      await queryInterface.bulkInsert(
        'susu_provider_roles',
        rolesData.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // Commit transaction if all inserts succeed
      await transaction.commit();
    } catch (error) {
      // Rollback transaction if any step fails
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('susu_provider_roles', null, { transaction });
      await transaction.commit();
    } catch (error) {
      // Rollback transaction if any step fails
      await transaction.rollback();
      throw error;
    }
  },
};
