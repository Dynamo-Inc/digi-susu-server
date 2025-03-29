require('dotenv').config();

module.exports = {
  development: {
    username: process.env['DATABASE_USER'] || 'postgres',
    password: process.env['DATABASE_PASSWORD'] || 'Dodoo123#',
    database: process.env['DATABASE_NAME'] || 'susu-db',
    host: process.env['DATABASE_HOST'] || 'localhost',
    dialect: process.env['DATABASE_DIALECT'] || 'postgres',
    port: process.env['DATABASE_PORT'] || 5432,
    // dialectOptions: {
    //   options: {
    //     encrypt: true,
    //     trustServerCertificate: false,
    //   },
    // },
  },
  staging: {
    username: process.env['DATABASE_USER'] || '',
    password: process.env['DATABASE_PASSWORD'] || '',
    database: process.env['DATABASE_NAME'] || '',
    host: process.env['DATABASE_HOST'] || '',
    dialect: process.env['DATABASE_DIALECT'] || '',
    port: process.env['DATABASE_PORT'] || 5432,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: process.env['DATABASE_USER'] || '',
    password: process.env['DATABASE_PASSWORD'] || '',
    database: process.env['DATABASE_NAME'] || '',
    host: process.env['DATABASE_HOST'] || '',
    dialect: process.env['DATABASE_DIALECT'] || '',
    port: process.env['DATABASE_PORT'] || 5432,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
